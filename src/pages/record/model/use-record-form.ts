"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ConsultationMode } from "@/widgets/appointment-datetime-picker";

import {
  api,
  createAppointment,
  getClinicById,
  getDoctorAvailableSlots,
  getProfile,
  getServices,
  profileKeys,
} from "@/shared/api";
import type {
  AppointmentResponse,
  CreateAppointmentRequest,
} from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { extractErrorMessage } from "@/shared/lib/errors";
import { useAuthStore, useCityStore } from "@/shared/store";

import { SELECTION_LABELS } from "./constants";
import {
  filterSelectionItems,
  groupAvailableSlots,
  isEmailValid,
  isPhoneValid,
  normalizeLocalPhone,
  toApiDate,
  toApiTime,
} from "./lib";
import type {
  Clinic,
  Doctor,
  MobileSelectionStage,
  MobileStep,
  OptionalFormErrors,
  SelectionItem,
  SelectionModalType,
  Service,
} from "./types";

// Порядок цепочки модалок десктопа: выбор клиники/врача сразу закрывает
// текущую модалку и открывает следующую. Услуга — конечное звено с
// множественным выбором, поэтому не участвует в автопереходе.
const SELECTION_CHAIN: Exclude<SelectionModalType, null>[] = [
  "clinic",
  "doctor",
  "service",
];

export const useRecordForm = () => {
  const router = useRouter();
  const urlParams = useSearchParams() ?? new URLSearchParams();

  const [mobileStep, setMobileStep] = useState<MobileStep>(1);
  const [mobileSelectionStage, setMobileSelectionStage] =
    useState<MobileSelectionStage>("clinic");

  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  // Услуг можно выбрать несколько — храним массив id, цена суммируется.
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const [mode, setMode] = useState<ConsultationMode>("offline");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [activeModal, setActiveModal] = useState<SelectionModalType>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<OptionalFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [appointmentResult, setAppointmentResult] =
    useState<AppointmentResponse | null>(null);

  const queryClient = useQueryClient();
  const createAppointmentMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      // Keep the profile history fresh with the newly created appointment.
      queryClient.invalidateQueries({
        queryKey: [...profileKeys.all, "appointments"],
      });
    },
  });

  const canUseOnline = useAuthStore((state) => Boolean(state.accessToken));

  const { data: profile } = useQuery({
    queryKey: ["record-profile"],
    queryFn: () => getProfile(),
    enabled: canUseOnline,
  });

  useEffect(() => {
    if (profile) {
      if (profile.first_name) setFirstName(profile.first_name);
      if (profile.last_name) setLastName(profile.last_name);
      if (profile.phone) {
        let localPhone = profile.phone;
        if (localPhone.startsWith("+996")) {
          localPhone = localPhone.slice(4);
        } else if (localPhone.startsWith("996")) {
          localPhone = localPhone.slice(3);
        } else if (localPhone.startsWith("+")) {
          localPhone = localPhone.slice(1);
        }
        const cleaned = localPhone.replace(/\D/g, "");
        setPhone(normalizeLocalPhone(cleaned));
      }
      if (profile.email) setEmail(profile.email);
    }
  }, [profile]);

  const { data: clinicsData = [] } = useQuery({
    queryKey: ["record-clinics"],
    queryFn: () => api.getClinics(),
  });

  // Врачи выбранного города; page_size поднят, иначе бэк отдаст только
  // первую страницу (20 записей) и в форме будут видны не все врачи.
  const selectedCity = useCityStore((s) => s.city);
  const { data: doctorsData = [] } = useQuery({
    queryKey: ["record-doctors", selectedCity],
    queryFn: () => api.getDoctors({ city: selectedCity, page_size: 200 }),
  });

  // Детали выбранной клиники — источник её списка врачей для шага «Выберите
  // специалиста». Пока клиника не выбрана, запрос не идёт.
  const { data: clinicDetail, isLoading: isLoadingClinicDoctors } = useQuery({
    queryKey: ["record-clinic-detail", selectedClinicId],
    queryFn: () => getClinicById(selectedClinicId as string),
    enabled: Boolean(selectedClinicId),
  });

  // Бэк моделирует услуги клиники и услуги конкретного врача как
  // непересекающиеся наборы (у "докторских" услуг clinic всегда null) —
  // передача clinic_id и doctor_id вместе даёт пересечение, которое всегда
  // пусто. Поэтому фильтруем по врачу, если он выбран, и только иначе — по
  // клинике целиком.
  const { data: servicesRaw } = useQuery({
    queryKey: ["record-services", selectedClinicId, selectedDoctorId],
    queryFn: () =>
      getServices(
        selectedDoctorId
          ? { doctor_id: selectedDoctorId }
          : selectedClinicId
            ? { clinic_id: selectedClinicId }
            : {},
      ),
  });

  const selectedDateStr = selectedDate ? toApiDate(selectedDate) : null;

  const { data: slotsData, isLoading: isLoadingSlots } = useQuery({
    queryKey: ["record-available-slots", selectedDoctorId, selectedDateStr],
    queryFn: () =>
      getDoctorAvailableSlots(
        selectedDoctorId as string,
        selectedDateStr as string,
      ),
    enabled: Boolean(selectedDoctorId) && Boolean(selectedDateStr),
  });

  const timeGroups = useMemo(
    () => groupAvailableSlots(slotsData?.slots ?? []),
    [slotsData],
  );

  // Слоты зависят от врача и даты — старый выбор времени может не совпасть
  // ни с одним реальным слотом новой пары, сбрасываем, чтобы не отправить
  // невалидное время молча.
  useEffect(() => {
    setSelectedTime(null);
  }, [selectedDoctorId, selectedDateStr]);

  const CLINICS: Clinic[] = clinicsData.map((c) => ({
    id: c.id,
    name: c.name,
    rating: c.rating,
    reviews: c.reviews,
    experience: c.experience,
    address: c.address,
    image: c.image ?? "",
  }));

  const DOCTORS: Doctor[] = doctorsData.map((d) => ({
    id: String(d.id),
    clinicId: d.workplaces[0]?.clinicId ?? "",
    name: d.name,
    specialty: d.specialty,
    rating: d.rating,
    reviews: d.reviews,
    experience: d.experience,
    image: d.image ?? "",
  }));

  // Врачи выбранной клиники (GET /api/clinics/{id}/). Когда клиника выбрана,
  // именно этот список показываем в «Выберите специалиста», а не всех по городу.
  const CLINIC_DOCTORS: Doctor[] = (clinicDetail?.doctors ?? []).map((d) => ({
    id: String(d.id),
    clinicId: selectedClinicId ?? "",
    name: d.full_name,
    specialty: d.specialty,
    rating: d.rating,
    reviews: 0,
    experience: d.experience_years,
    image: d.photo ?? "",
  }));

  const SERVICES: Service[] = (servicesRaw?.data ?? []).map((s) => ({
    id: String(s.id),
    clinicId: "",
    doctorIds: [],
    title: s.name,
    category: s.category,
    price: typeof s.price === "string" ? parseFloat(s.price) || 0 : 0,
    rating: 0,
    reviews: 0,
    image: "",
  }));

  useEffect(() => {
    const serviceId = urlParams.get("service");
    if (serviceId) setSelectedServiceIds([serviceId]);
    const doctorId = urlParams.get("doctor");
    if (doctorId) setSelectedDoctorId(doctorId);
    const clinicId = urlParams.get("clinic");
    if (clinicId) setSelectedClinicId(clinicId);
    const modeParam = urlParams.get("mode");
    if (modeParam === "online" || modeParam === "offline") setMode(modeParam);

    // Deep-link с карточки/страницы врача (или услуги) — сразу переводим
    // мобильный степпер на следующий актуальный этап цепочки клиника→врач→
    // услуга, иначе он всегда стартует с «clinic» и заставляет повторно
    // выбирать то, что уже пришло в URL.
    if (doctorId) {
      setMobileSelectionStage("service");
    } else if (clinicId) {
      setMobileSelectionStage("doctor");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clinicMap = useMemo(
    () => new Map(CLINICS.map((clinic) => [clinic.id, clinic])),
    [CLINICS],
  );

  const selectedClinic = useMemo(
    () => CLINICS.find((clinic) => clinic.id === selectedClinicId) ?? null,
    [CLINICS, selectedClinicId],
  );
  // Пул для поиска: если клиника выбрана — её врачи, иначе все по городу.
  // Объединяем, чтобы выбранный врач нашёлся, даже если детали клиники ещё
  // грузятся или врач был выбран до выбора клиники (deep link).
  const doctorPool = useMemo(
    () => [...CLINIC_DOCTORS, ...DOCTORS],
    [CLINIC_DOCTORS, DOCTORS],
  );

  const selectedDoctor = useMemo(
    () => doctorPool.find((doctor) => doctor.id === selectedDoctorId) ?? null,
    [doctorPool, selectedDoctorId],
  );
  const selectedServices = useMemo(
    () => SERVICES.filter((service) => selectedServiceIds.includes(service.id)),
    [SERVICES, selectedServiceIds],
  );
  const totalPrice = useMemo(
    () => selectedServices.reduce((sum, service) => sum + service.price, 0),
    [selectedServices],
  );

  // Клиника выбрана → список врачей из GET /api/clinics/{id}/;
  // иначе — все врачи города.
  const doctorOptions = useMemo(
    () => (selectedClinicId ? CLINIC_DOCTORS : DOCTORS),
    [selectedClinicId, CLINIC_DOCTORS, DOCTORS],
  );

  const serviceOptions = SERVICES;

  const isStep2Complete = Boolean(selectedDate) && Boolean(selectedTime);

  const applyClinicSelection = (clinicId: string) => {
    if (clinicId === selectedClinicId) return;

    setSelectedClinicId(clinicId);
    // Врачи берутся из выбранной клиники (свой список, грузится отдельно),
    // поэтому прежний врач и услуги могут к ней не относиться — сбрасываем,
    // чтобы пользователь выбрал специалиста заново из списка этой клиники.
    setSelectedDoctorId(null);
    setSelectedServiceIds([]);
  };

  const applyDoctorSelection = (doctorId: string) => {
    const matchedDoctor = doctorPool.find((doctor) => doctor.id === doctorId);
    if (!matchedDoctor) return;

    setSelectedDoctorId(doctorId);
    // Врач выбран первым (без клиники) — подтягиваем его клинику из места
    // работы. Если клиника уже выбрана, врач из её же списка — не трогаем.
    if (matchedDoctor.clinicId && selectedClinicId !== matchedDoctor.clinicId) {
      setSelectedClinicId(matchedDoctor.clinicId);
    }

    // Услуги привязаны к паре клиника/врач — при смене врача сбрасываем выбор.
    setSelectedServiceIds([]);
  };

  // Услуга не выбирается «насмерть», а переключается — можно выбрать несколько.
  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  const modalConfig = useMemo(() => {
    if (!activeModal) return null;

    const items =
      activeModal === "clinic"
        ? (CLINICS as SelectionItem[])
        : activeModal === "doctor"
          ? (doctorOptions as SelectionItem[])
          : (serviceOptions as SelectionItem[]);

    return { ...SELECTION_LABELS[activeModal], items };
  }, [activeModal, CLINICS, doctorOptions, serviceOptions]);

  const filteredModalItems = useMemo(() => {
    if (!modalConfig) return [];
    return filterSelectionItems(modalConfig.items, searchQuery);
  }, [modalConfig, searchQuery]);

  const mobileStep1Config = useMemo(() => {
    const items =
      mobileSelectionStage === "clinic"
        ? (CLINICS as SelectionItem[])
        : mobileSelectionStage === "doctor"
          ? (doctorOptions as SelectionItem[])
          : (serviceOptions as SelectionItem[]);

    const selectedId =
      mobileSelectionStage === "clinic"
        ? selectedClinicId
        : mobileSelectionStage === "doctor"
          ? selectedDoctorId
          : null;

    return { ...SELECTION_LABELS[mobileSelectionStage], items, selectedId };
  }, [
    mobileSelectionStage,
    selectedClinicId,
    selectedDoctorId,
    CLINICS,
    doctorOptions,
    serviceOptions,
  ]);

  const filteredMobileStep1Items = useMemo(
    () => filterSelectionItems(mobileStep1Config.items, searchQuery),
    [mobileStep1Config.items, searchQuery],
  );

  // Клиника/врач выбираются «насмерть» — тап сразу переводит к следующему
  // этапу. Услуга переключается (множественный выбор) и остаётся на месте,
  // пользователь сам жмёт «Продолжить».
  const handleMobileStep1Select = (id: string) => {
    if (mobileSelectionStage === "clinic") {
      applyClinicSelection(id);
      setMobileSelectionStage("doctor");
      setSearchQuery("");
      return;
    }

    if (mobileSelectionStage === "doctor") {
      applyDoctorSelection(id);
      setMobileSelectionStage("service");
      setSearchQuery("");
      return;
    }

    toggleServiceSelection(id);
  };

  const handleMobileStep1Continue = () => {
    if (selectedServiceIds.length === 0) return;
    setSearchQuery("");
    setMobileStep(2);
  };

  const handleRecordBack = () => {
    if (mobileStep === 3) {
      setMobileStep(2);
      return;
    }

    if (mobileStep === 2) {
      setMobileStep(1);
      setMobileSelectionStage(
        selectedServiceIds.length > 0
          ? "service"
          : selectedDoctorId
            ? "doctor"
            : "clinic",
      );
      setSearchQuery("");
      return;
    }

    if (mobileSelectionStage === "service") {
      setMobileSelectionStage("doctor");
      setSearchQuery("");
      return;
    }

    if (mobileSelectionStage === "doctor") {
      setMobileSelectionStage("clinic");
      setSearchQuery("");
      return;
    }

    router.push(ROUTES.HOME);
  };

  const openModal = (type: Exclude<SelectionModalType, null>) => {
    setActiveModal(type);
    setSearchQuery("");
  };

  const closeModal = () => {
    setActiveModal(null);
    setSearchQuery("");
  };

  // Выбор пункта списка в десктопной модалке: клиника/врач — применяются
  // сразу и открывают следующую модалку в цепочке; услуга — переключается
  // (можно выбрать несколько), модалка остаётся открытой.
  const handleModalItemSelect = (id: string) => {
    if (!activeModal) return;

    if (activeModal === "service") {
      toggleServiceSelection(id);
      return;
    }

    if (activeModal === "clinic") applyClinicSelection(id);
    else applyDoctorSelection(id);

    const nextType = SELECTION_CHAIN[SELECTION_CHAIN.indexOf(activeModal) + 1];
    if (nextType) {
      setActiveModal(nextType);
      setSearchQuery("");
    } else {
      closeModal();
    }
  };

  const buildAppointmentRequest = (): CreateAppointmentRequest | null => {
    if (!selectedDate || !selectedTime) return null;

    const request: CreateAppointmentRequest = {
      date: toApiDate(selectedDate),
      time: toApiTime(selectedTime),
      is_online: mode === "online" && canUseOnline,
    };

    if (selectedDoctorId) request.doctor_id = Number(selectedDoctorId);
    if (selectedClinicId) request.clinic_id = Number(selectedClinicId);
    // Бэк принимает только один service_id — уходит первая выбранная услуга,
    // остальные добавляем в notes, чтобы врач видел полный список.
    if (selectedServiceIds[0])
      request.service_id = Number(selectedServiceIds[0]);
    const extraServices = selectedServices.slice(1).map((s) => s.title);
    const notesParts = [
      ...(extraServices.length
        ? [`Также выбраны услуги: ${extraServices.join(", ")}`]
        : []),
      ...(comment.trim() ? [comment.trim()] : []),
    ];
    if (notesParts.length) request.notes = notesParts.join(". ");

    // Guests pass their contacts explicitly; authenticated bookings are tied
    // to the logged-in user on the server, so no guest_* fields are sent.
    if (!canUseOnline) {
      request.guest_name = `${firstName.trim()} ${lastName.trim()}`.trim();
      request.guest_phone = `+996 ${phone.trim()}`;
      if (email.trim()) request.guest_email = email.trim();
    }

    return request;
  };

  const validateAndSubmit = async () => {
    const nextErrors: OptionalFormErrors = {};

    // Для авторизованных пользователей имя/фамилия/телефон не уходят на бэк
    // (запись привязывается к JWT-юзеру, см. buildAppointmentRequest) —
    // требовать их незачем.
    if (!canUseOnline) {
      if (!firstName.trim()) nextErrors.firstName = "Введите ваше имя";
      if (!lastName.trim()) nextErrors.lastName = "Введите вашу фамилию";

      if (!phone.trim()) {
        nextErrors.phone = "Введите номер телефона";
      } else if (!isPhoneValid(phone)) {
        nextErrors.phone = "Проверьте формат телефона";
      }
    }

    if (email && !isEmailValid(email)) {
      nextErrors.email = "Введите корректный email";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const request = buildAppointmentRequest();
    if (!request) {
      setErrors((prev) => ({
        ...prev,
        submit: "Выберите дату и время приёма",
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createAppointmentMutation.mutateAsync(request);
      setAppointmentResult(result);
      setShowSuccess(true);
    } catch (err: unknown) {
      // Бэк теперь отклоняет 400 при неопубликованном враче/клинике или
      // is_online_available: false — показываем настоящую причину, а не
      // общую заглушку.
      const errData = (err as { response?: { data?: unknown } })?.response
        ?.data;
      setErrors((prev) => ({
        ...prev,
        submit: extractErrorMessage(
          errData,
          "Не удалось создать запись. Попробуйте ещё раз.",
        ),
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    router,
    mobileStep,
    setMobileStep,
    mode,
    setMode,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    timeGroups,
    isLoadingSlots,
    activeModal,
    searchQuery,
    setSearchQuery,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    phone,
    setPhone,
    email,
    setEmail,
    comment,
    setComment,
    errors,
    setErrors,
    isSubmitting,
    showSuccess,
    setShowSuccess,
    googleMeetLink: appointmentResult?.google_meet_link ?? null,
    appointmentResult,
    canUseOnline,
    clinicMap,
    selectedClinic,
    selectedDoctor,
    selectedServices,
    selectedServiceIds,
    totalPrice,
    mobileSelectionStage,
    isStep2Complete,
    modalConfig,
    filteredModalItems,
    mobileStep1Config,
    filteredMobileStep1Items,
    // Список врачей выбранной клиники грузится отдельным запросом — показываем
    // загрузку вместо «Ничего не найдено», пока он не пришёл.
    isDoctorModalLoading: activeModal === "doctor" && isLoadingClinicDoctors,
    isDoctorStageLoading:
      mobileSelectionStage === "doctor" && isLoadingClinicDoctors,
    handleMobileStep1Select,
    handleMobileStep1Continue,
    handleRecordBack,
    openModal,
    closeModal,
    handleModalItemSelect,
    validateAndSubmit,
  };
};

export type RecordForm = ReturnType<typeof useRecordForm>;
