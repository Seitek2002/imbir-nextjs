"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { ConsultationMode } from "@/widgets/appointment-datetime-picker";

import {
  api,
  createAppointment,
  getClinicById,
  getDoctorAvailableSlots,
  getProfile,
  getServiceById,
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

// Список клиник в модалке «Клиника»: как и на /clinics, /specialists,
// /services — постраничная подгрузка с кнопкой «Показать ещё», иначе бэк
// отдаёт только первую страницу и часть клиник в форме записи не найти.
const CLINICS_PAGE_SIZE = 20;

export const useRecordForm = () => {
  const router = useRouter();
  const urlParams = useSearchParams() ?? new URLSearchParams();

  const [mobileStep, setMobileStep] = useState<MobileStep>(1);
  const [mobileSelectionStage, setMobileSelectionStage] =
    useState<MobileSelectionStage>("clinic");

  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );
  // Врач пришёл по ссылке без явной клиники (см. эффект ниже) — пока список
  // врачей не загрузился, не знаем, сколько у него мест работы.
  const [pendingWorkplaceDoctorId, setPendingWorkplaceDoctorId] = useState<
    string | null
  >(null);

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

  const {
    data: clinicsPages,
    fetchNextPage: fetchMoreClinics,
    hasNextPage: hasMoreClinics,
    isFetchingNextPage: isFetchingMoreClinics,
  } = useInfiniteQuery({
    queryKey: ["record-clinics"],
    queryFn: ({ pageParam }) =>
      api.getClinicsPaginated({
        page: pageParam,
        page_size: CLINICS_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage && lastPage.pagination.page < lastPage.pagination.total_pages
        ? lastPage.pagination.page + 1
        : undefined,
  });

  const clinicsData = useMemo(
    () => clinicsPages?.pages.flatMap((page) => page.data) ?? [],
    [clinicsPages],
  );

  // Стор города персистится из localStorage асинхронно, уже ПОСЛЕ маунта. У
  // /specialists есть безопасный дефолт на время гидратации — сервер читает
  // тот же город из cookie и передаёт его пропом, так что оба значения
  // заведомо совпадают. У /record такого cookie-чтения на сервере нет,
  // поэтому вместо подстраховки фейковым дефолтом (он может не совпасть с
  // реальным городом и уйдёт лишний повторный запрос) просто ждём реального
  // завершения гидратации стора — если она уже случилась (переход с другой
  // страницы SPA, стор общий на всё приложение), запрос уйдёт сразу.
  const selectedCity = useCityStore((s) => s.city);
  // Инициализируем false безусловно — на сервере (SSR) persist-объект стора
  // недоступен (localStorage там нет), а useState-инициализатор выполняется
  // и на сервере тоже. Любое обращение к useCityStore.persist делаем только
  // внутри эффекта, который на сервере не выполняется в принципе.
  const [isCityHydrated, setIsCityHydrated] = useState(false);
  useEffect(() => {
    if (useCityStore.persist.hasHydrated()) {
      setIsCityHydrated(true);
      return;
    }
    return useCityStore.persist.onFinishHydration(() =>
      setIsCityHydrated(true),
    );
  }, []);

  // Врачи выбранного города; page_size поднят, иначе бэк отдаст только
  // первую страницу (20 записей) и в форме будут видны не все врачи.
  const { data: doctorsData = [] } = useQuery({
    queryKey: ["record-doctors", selectedCity],
    queryFn: () => api.getDoctors({ city: selectedCity, page_size: 200 }),
    enabled: isCityHydrated,
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

  // Собственная клиника/врач(и) выбранной услуги — GET /api/services/{id}/
  // (в отличие от списка, отдаёт clinic целиком и doctors). Нужно для двух
  // вещей: 1) когда услугу выбрали ДО клиники/врача (страница услуг даёт
  // только ?service=), заполнить их автоматически, а не заставлять гадать;
  // 2) не сбрасывать уже выбранную услугу, если следующий выбор клиники/
  // врача ей не противоречит (см. applyClinicSelection/applyDoctorSelection).
  const { data: serviceDetail } = useQuery({
    queryKey: ["record-service-detail", selectedServiceId],
    queryFn: () => getServiceById(selectedServiceId as string),
    enabled: Boolean(selectedServiceId),
  });

  const serviceClinicId = serviceDetail?.clinic
    ? String(serviceDetail.clinic.id)
    : null;
  // null = услуга не закреплена за конкретным врачом (или ещё грузится) —
  // подходит любой врач клиники. Непустой набор — только эти id.
  const serviceDoctorIds = useMemo(
    () =>
      serviceDetail && serviceDetail.doctors.length > 0
        ? new Set(serviceDetail.doctors.map((d) => String(d.id)))
        : null,
    [serviceDetail],
  );

  // Заход "с услуги": она уже выбрана (из URL ?service=), а клиника/врач —
  // ещё нет. Подставляем их сами, если это можно решить однозначно, вместо
  // того чтобы заставлять пользователя искать вручную (и рисковать
  // случайно выбрать врача, который эту услугу не ведёт).
  useEffect(() => {
    if (!serviceDetail) return;

    const soleDoctorId =
      serviceDetail.doctors.length === 1
        ? String(serviceDetail.doctors[0].id)
        : null;

    const willSetClinic = !selectedClinicId && !!serviceClinicId;
    const willSetDoctor = !selectedDoctorId && !!soleDoctorId;

    if (willSetClinic) setSelectedClinicId(serviceClinicId as string);
    if (willSetDoctor) setSelectedDoctorId(soleDoctorId as string);

    const clinicResolved = Boolean(selectedClinicId) || willSetClinic;
    const doctorResolved = Boolean(selectedDoctorId) || willSetDoctor;

    if (clinicResolved && doctorResolved) {
      setMobileStep(2);
    } else if (clinicResolved) {
      setMobileSelectionStage("doctor");
    }
    // Срабатывает только на смену самой услуги/её деталей — иначе перебивало
    // бы дальнейший ручной выбор пользователя тем же автозаполнением.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceDetail]);

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
    workplaces: d.workplaces.map((w) => ({
      clinicId: w.clinicId,
      clinicName: w.clinicName,
      clinicAddress: w.clinicAddress,
    })),
    name: d.name,
    specialty: d.specialty,
    rating: d.rating,
    reviews: d.reviews,
    experience: d.experience,
    image: d.image ?? "",
  }));

  // Врачи выбранной клиники (GET /api/clinics/{id}/). Когда клиника выбрана,
  // именно этот список показываем в «Выберите специалиста», а не всех по городу.
  // Место работы тут всегда одно и уже известно — сама клиника, из списка
  // которой этот врач получен.
  const CLINIC_DOCTORS: Doctor[] = (clinicDetail?.doctors ?? []).map((d) => ({
    id: String(d.id),
    clinicId: selectedClinicId ?? "",
    workplaces: selectedClinicId
      ? [
          {
            clinicId: selectedClinicId,
            clinicName: clinicDetail?.name ?? "",
          },
        ]
      : [],
    name: d.full_name,
    specialty: d.specialty,
    rating: d.rating,
    reviews: 0,
    experience: d.experience_years,
    image: d.photo ?? "",
  }));

  const SERVICES: Service[] = (servicesRaw?.data ?? []).map((s) => ({
    id: String(s.id),
    clinicId: s.clinic ? String(s.clinic.id) : "",
    clinicName: s.clinic?.name,
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
    if (serviceId) setSelectedServiceId(serviceId);
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
    if (doctorId && !clinicId) {
      // Клиника не указана явно — решим по числу мест работы врача, как
      // только прогрузится список врачей (см. эффект ниже).
      setPendingWorkplaceDoctorId(doctorId);
    } else if (doctorId) {
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

  // Разрешаем неоднозначность места работы для врача, пришедшего по ссылке
  // без явной клиники: одно место работы — подставляем его молча; несколько
  // — сразу открываем выбор места работы (как и при обычном интерактивном
  // выборе врача, см. applyDoctorSelection).
  useEffect(() => {
    if (!pendingWorkplaceDoctorId) return;

    const matchedDoctor = doctorPool.find(
      (doctor) => doctor.id === pendingWorkplaceDoctorId,
    );
    if (!matchedDoctor) return;

    setPendingWorkplaceDoctorId(null);

    if (matchedDoctor.workplaces.length > 1) {
      setMobileSelectionStage("workplace");
      setActiveModal("workplace");
    } else {
      if (matchedDoctor.workplaces[0]) {
        setSelectedClinicId(matchedDoctor.workplaces[0].clinicId);
      }
      setMobileSelectionStage("service");
    }
  }, [pendingWorkplaceDoctorId, doctorPool]);

  const selectedDoctor = useMemo(
    () => doctorPool.find((doctor) => doctor.id === selectedDoctorId) ?? null,
    [doctorPool, selectedDoctorId],
  );
  const selectedService = useMemo(
    () => SERVICES.find((service) => service.id === selectedServiceId) ?? null,
    [SERVICES, selectedServiceId],
  );

  // Клиника выбрана → список врачей из GET /api/clinics/{id}/;
  // иначе — все врачи города. Если вдобавок уже выбрана услуга, закреплённая
  // за конкретным врачом (или несколькими) — сужаем список до них: иначе
  // можно выбрать врача, который эту услугу не ведёт (см. serviceDoctorIds).
  const doctorOptions = useMemo(() => {
    const pool = selectedClinicId ? CLINIC_DOCTORS : DOCTORS;
    if (!serviceDoctorIds) return pool;
    return pool.filter((doctor) => serviceDoctorIds.has(doctor.id));
  }, [selectedClinicId, CLINIC_DOCTORS, DOCTORS, serviceDoctorIds]);

  const serviceOptions = SERVICES;

  // Места работы текущего выбранного врача — показываются как обычные
  // «клиники» (та же карточка), когда у врача их несколько и нужно уточнить,
  // в каком из них оформляется приём.
  const workplaceOptions: Clinic[] = useMemo(() => {
    const doctor = doctorPool.find((d) => d.id === selectedDoctorId);
    if (!doctor) return [];

    return doctor.workplaces.map((w) => ({
      id: w.clinicId,
      name: w.clinicName,
      rating: 0,
      reviews: 0,
      experience: 0,
      address: w.clinicAddress ?? "",
      image: "",
    }));
  }, [doctorPool, selectedDoctorId]);

  const isStep2Complete = Boolean(selectedDate) && Boolean(selectedTime);

  const applyClinicSelection = (clinicId: string) => {
    if (clinicId === selectedClinicId) return;

    setSelectedClinicId(clinicId);
    // Врачи берутся из выбранной клиники (свой список, грузится отдельно),
    // поэтому прежний врач ей может не соответствовать — сбрасываем, чтобы
    // пользователь выбрал специалиста заново из списка этой клиники.
    setSelectedDoctorId(null);
    // Услугу сбрасываем, только если она закреплена за ДРУГОЙ клиникой.
    // Раньше сбрасывали всегда — из-за этого при заходе "с услуги" (её
    // выбрали раньше клиники, см. serviceDetail-эффект выше) любой выбор
    // клиники тут же стирал уже сделанный пользователем выбор услуги.
    if (serviceClinicId && serviceClinicId !== clinicId) {
      setSelectedServiceId(null);
    }
  };

  // Возвращает true, если после выбора врача нужно ещё уточнить у
  // пользователя, в каком из его мест работы оформляется приём.
  const applyDoctorSelection = (doctorId: string): boolean => {
    const matchedDoctor = doctorPool.find((doctor) => doctor.id === doctorId);
    if (!matchedDoctor) return false;

    setSelectedDoctorId(doctorId);
    // Услугу сбрасываем, только если она закреплена за конкретным врачом (или
    // несколькими) и выбранного среди них нет — иначе, как и с клиникой
    // выше, стирали бы уже сделанный выбор при заходе "с услуги". Услуги без
    // привязки к конкретному врачу (serviceDoctorIds === null) годятся любому
    // врачу этой клиники.
    if (serviceDoctorIds && !serviceDoctorIds.has(doctorId)) {
      setSelectedServiceId(null);
    }

    // Врач выбран из списка уже выбранной клиники — место работы однозначно
    // (эта же клиника), трогать его не нужно.
    if (selectedClinicId) return false;

    // Врач выбран «с нуля», без привязки к клинике. Одно место работы —
    // подставляем его молча; несколько — неоднозначно, пусть решает
    // пользователь (см. вызовы applyDoctorSelection).
    if (matchedDoctor.workplaces.length > 1) return true;

    setSelectedClinicId(matchedDoctor.workplaces[0]?.clinicId ?? null);
    return false;
  };

  // Клиника выбирается из мест работы уже выбранного врача — в отличие от
  // applyClinicSelection, врача и услугу трогать не нужно: они относятся к
  // тому же врачу, просто уточняется, в каком из его мест работы.
  const applyWorkplaceSelection = (clinicId: string) => {
    setSelectedClinicId(clinicId);
  };

  const selectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
  };

  const modalConfig = useMemo(() => {
    if (!activeModal) return null;

    const items =
      activeModal === "clinic"
        ? (CLINICS as SelectionItem[])
        : activeModal === "doctor"
          ? (doctorOptions as SelectionItem[])
          : activeModal === "workplace"
            ? (workplaceOptions as SelectionItem[])
            : (serviceOptions as SelectionItem[]);

    return { ...SELECTION_LABELS[activeModal], items };
  }, [activeModal, CLINICS, doctorOptions, workplaceOptions, serviceOptions]);

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
          : mobileSelectionStage === "workplace"
            ? (workplaceOptions as SelectionItem[])
            : (serviceOptions as SelectionItem[]);

    const selectedId =
      mobileSelectionStage === "clinic"
        ? selectedClinicId
        : mobileSelectionStage === "doctor"
          ? selectedDoctorId
          : mobileSelectionStage === "workplace"
            ? selectedClinicId
            : selectedServiceId;

    return { ...SELECTION_LABELS[mobileSelectionStage], items, selectedId };
  }, [
    mobileSelectionStage,
    selectedClinicId,
    selectedDoctorId,
    selectedServiceId,
    CLINICS,
    doctorOptions,
    workplaceOptions,
    serviceOptions,
  ]);

  const filteredMobileStep1Items = useMemo(
    () => filterSelectionItems(mobileStep1Config.items, searchQuery),
    [mobileStep1Config.items, searchQuery],
  );

  // Каждый этап выбирается «насмерть» — тап сразу переводит к следующему
  // этапу цепочки, а с последнего (услуга) — сразу к шагу 2. У врача с
  // несколькими местами работы между «доктором» и «услугой» вклинивается
  // этап «место приёма».
  const handleMobileStep1Select = (id: string) => {
    if (mobileSelectionStage === "clinic") {
      applyClinicSelection(id);
      setMobileSelectionStage("doctor");
      setSearchQuery("");
      return;
    }

    if (mobileSelectionStage === "doctor") {
      const needsWorkplace = applyDoctorSelection(id);
      setSearchQuery("");
      setMobileSelectionStage(needsWorkplace ? "workplace" : "service");
      return;
    }

    if (mobileSelectionStage === "workplace") {
      applyWorkplaceSelection(id);
      setMobileSelectionStage("service");
      setSearchQuery("");
      return;
    }

    selectService(id);
    setSearchQuery("");
    setMobileStep(2);
  };

  const handleRecordBack = () => {
    if (mobileStep === 3) {
      setMobileStep(2);
      return;
    }

    // Врач с несколькими местами работы прошёл через отдельный этап «место
    // приёма» — назад с шага 2 или с «услуги» нужно вернуть именно туда, а
    // не сразу к «доктору».
    const doctorHasMultipleWorkplaces =
      (doctorPool.find((doctor) => doctor.id === selectedDoctorId)?.workplaces
        .length ?? 0) > 1;

    if (mobileStep === 2) {
      setMobileStep(1);
      setMobileSelectionStage(
        selectedServiceId ? "service" : selectedDoctorId ? "doctor" : "clinic",
      );
      setSearchQuery("");
      return;
    }

    if (mobileSelectionStage === "service") {
      setMobileSelectionStage(
        doctorHasMultipleWorkplaces ? "workplace" : "doctor",
      );
      setSearchQuery("");
      return;
    }

    if (mobileSelectionStage === "workplace") {
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

  // Выбор пункта списка в десктопной модалке применяется сразу и открывает
  // следующую модалку в цепочке; на последнем звене (услуга) модалка
  // закрывается. У врача с несколькими местами работы после «доктора»
  // открывается «место приёма» вместо «услуги».
  const handleModalItemSelect = (id: string) => {
    if (!activeModal) return;

    if (activeModal === "clinic") {
      applyClinicSelection(id);
      setActiveModal("doctor");
      setSearchQuery("");
      return;
    }

    if (activeModal === "doctor") {
      const needsWorkplace = applyDoctorSelection(id);
      setSearchQuery("");
      setActiveModal(needsWorkplace ? "workplace" : "service");
      return;
    }

    if (activeModal === "workplace") {
      applyWorkplaceSelection(id);
      setActiveModal("service");
      setSearchQuery("");
      return;
    }

    selectService(id);
    closeModal();
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
    if (selectedServiceId) request.service_id = Number(selectedServiceId);
    if (comment.trim()) request.notes = comment.trim();

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

  // Закрытие модалки успеха («Спасибо» или клик по подложке). Раньше здесь
  // было только setShowSuccess(false): пользователь оставался на той же
  // заполненной форме с активной кнопкой «Записаться» — выглядело как будто
  // запись не прошла, и вторым кликом создавался дубль на тот же слот.
  // Уводим на список записей; гостя — на главную, в профиль его не пустит
  // AuthGuard.
  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.push(canUseOnline ? ROUTES.PROFILE_HISTORY : ROUTES.HOME);
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
    // setShowSuccess наружу не отдаём: закрывать модалку успеха можно только
    // через handleSuccessClose, иначе пользователь снова окажется на
    // заполненной форме и создаст дубль записи.
    handleSuccessClose,
    appointmentResult,
    canUseOnline,
    clinicMap,
    hasMoreClinics: Boolean(hasMoreClinics),
    isFetchingMoreClinics,
    fetchMoreClinics,
    selectedClinicId,
    selectedClinic,
    selectedDoctor,
    selectedService,
    selectedServiceId,
    // Места приёма выбранного врача. Нужны в Step1Selection: если их нет,
    // поле «Клиника» скрывается, иначе оно ведёт в пустую модалку.
    workplaceOptions,
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
    handleRecordBack,
    openModal,
    closeModal,
    handleModalItemSelect,
    validateAndSubmit,
  };
};

export type RecordForm = ReturnType<typeof useRecordForm>;
