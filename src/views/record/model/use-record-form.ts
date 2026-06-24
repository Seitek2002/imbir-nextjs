"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { type ConsultationMode } from "@/features/appointment-datetime-picker";

import { api } from "@/shared/api/requests";
import { getServices } from "@/shared/api/services/requests";
import { ROUTES } from "@/shared/config/routes";

import { SELECTION_LABELS } from "./constants";
import { filterSelectionItems, isEmailValid, isPhoneValid } from "./lib";
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

export const useRecordForm = () => {
  const router = useRouter();
  const urlParams = useSearchParams();

  const [mobileStep, setMobileStep] = useState<MobileStep>(1);
  const [mobileSelectionStage, setMobileSelectionStage] =
    useState<MobileSelectionStage>("clinic");

  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );

  const [mode, setMode] = useState<ConsultationMode>("offline");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [activeModal, setActiveModal] = useState<SelectionModalType>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalDraftSelection, setModalDraftSelection] = useState<string | null>(
    null,
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<OptionalFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: clinicsData = [] } = useQuery({
    queryKey: ["record-clinics"],
    queryFn: () => api.getClinics(),
  });

  const { data: doctorsData = [] } = useQuery({
    queryKey: ["record-doctors"],
    queryFn: () => api.getDoctors(),
  });

  const { data: servicesRaw } = useQuery({
    queryKey: ["record-services", selectedClinicId, selectedDoctorId],
    queryFn: () =>
      getServices({
        ...(selectedClinicId ? { clinic_id: selectedClinicId } : {}),
        ...(selectedDoctorId ? { doctor_id: selectedDoctorId } : {}),
      }),
  });

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
    if (serviceId) setSelectedServiceId(serviceId);
    const doctorId = urlParams.get("doctor");
    if (doctorId) setSelectedDoctorId(doctorId);
    const clinicId = urlParams.get("clinic");
    if (clinicId) setSelectedClinicId(clinicId);
    const modeParam = urlParams.get("mode");
    if (modeParam === "online" || modeParam === "offline") setMode(modeParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canUseOnline = useMemo(() => {
    if (typeof window === "undefined") return false;

    return (
      Boolean(window.localStorage.getItem("accessToken")) ||
      Boolean(window.localStorage.getItem("token")) ||
      Boolean(window.localStorage.getItem("imbir_access_token"))
    );
  }, []);

  const clinicMap = useMemo(
    () => new Map(CLINICS.map((clinic) => [clinic.id, clinic])),
    [CLINICS],
  );

  const selectedClinic = useMemo(
    () => CLINICS.find((clinic) => clinic.id === selectedClinicId) ?? null,
    [CLINICS, selectedClinicId],
  );
  const selectedDoctor = useMemo(
    () => DOCTORS.find((doctor) => doctor.id === selectedDoctorId) ?? null,
    [DOCTORS, selectedDoctorId],
  );
  const selectedService = useMemo(
    () => SERVICES.find((service) => service.id === selectedServiceId) ?? null,
    [SERVICES, selectedServiceId],
  );

  const doctorOptions = useMemo(
    () =>
      DOCTORS.filter(
        (doctor) => !selectedClinicId || doctor.clinicId === selectedClinicId,
      ),
    [DOCTORS, selectedClinicId],
  );

  const serviceOptions = SERVICES;

  const isStep2Complete = Boolean(selectedDate) && Boolean(selectedTime);

  const applyClinicSelection = (clinicId: string) => {
    setSelectedClinicId(clinicId);

    const matchedDoctor = DOCTORS.find(
      (doctor) =>
        doctor.id === selectedDoctorId && doctor.clinicId === clinicId,
    );

    if (!matchedDoctor) {
      setSelectedDoctorId(null);
      setSelectedServiceId(null);
      return;
    }

    const matchedService = SERVICES.find(
      (service) =>
        service.id === selectedServiceId &&
        service.clinicId === clinicId &&
        service.doctorIds.includes(matchedDoctor.id),
    );

    if (!matchedService) {
      setSelectedServiceId(null);
    }
  };

  const applyDoctorSelection = (doctorId: string) => {
    const matchedDoctor = DOCTORS.find((doctor) => doctor.id === doctorId);
    if (!matchedDoctor) return;

    setSelectedDoctorId(doctorId);
    if (selectedClinicId !== matchedDoctor.clinicId) {
      setSelectedClinicId(matchedDoctor.clinicId);
    }

    const matchedService = SERVICES.find(
      (service) =>
        service.id === selectedServiceId &&
        service.clinicId === matchedDoctor.clinicId &&
        service.doctorIds.includes(doctorId),
    );
    if (!matchedService) {
      setSelectedServiceId(null);
    }
  };

  const applyServiceSelection = (serviceId: string) => {
    setSelectedServiceId(serviceId);
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
          : selectedServiceId;

    return { ...SELECTION_LABELS[mobileSelectionStage], items, selectedId };
  }, [
    mobileSelectionStage,
    selectedClinicId,
    selectedDoctorId,
    selectedServiceId,
    CLINICS,
    doctorOptions,
    serviceOptions,
  ]);

  const filteredMobileStep1Items = useMemo(
    () => filterSelectionItems(mobileStep1Config.items, searchQuery),
    [mobileStep1Config.items, searchQuery],
  );

  const handleMobileStep1Select = (id: string) => {
    if (mobileSelectionStage === "clinic") {
      applyClinicSelection(id);
      return;
    }

    if (mobileSelectionStage === "doctor") {
      applyDoctorSelection(id);
      return;
    }

    applyServiceSelection(id);
  };

  const handleMobileStep1Continue = () => {
    if (mobileSelectionStage === "clinic") {
      if (!selectedClinicId) return;
      setMobileSelectionStage("doctor");
      setSearchQuery("");
      return;
    }

    if (mobileSelectionStage === "doctor") {
      if (!selectedDoctorId) return;
      setMobileSelectionStage("service");
      setSearchQuery("");
      return;
    }

    if (!selectedServiceId) return;
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
        selectedServiceId ? "service" : selectedDoctorId ? "doctor" : "clinic",
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

    const currentValue =
      type === "clinic"
        ? selectedClinicId
        : type === "doctor"
          ? selectedDoctorId
          : selectedServiceId;

    setModalDraftSelection(currentValue ?? null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSearchQuery("");
    setModalDraftSelection(null);
  };

  const applyModalSelection = () => {
    if (!activeModal || !modalDraftSelection) return;

    if (activeModal === "clinic") {
      applyClinicSelection(modalDraftSelection);
    } else if (activeModal === "doctor") {
      applyDoctorSelection(modalDraftSelection);
    } else {
      applyServiceSelection(modalDraftSelection);
    }

    closeModal();
  };

  const validateAndSubmit = () => {
    const nextErrors: OptionalFormErrors = {};

    if (!firstName.trim()) nextErrors.firstName = "Введите ваше имя";
    if (!lastName.trim()) nextErrors.lastName = "Введите вашу фамилию";

    if (!phone.trim()) {
      nextErrors.phone = "Введите номер телефона";
    } else if (!isPhoneValid(phone)) {
      nextErrors.phone = "Проверьте формат телефона";
    }

    if (email && !isEmailValid(email)) {
      nextErrors.email = "Введите корректный email";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      clinicId: selectedClinicId,
      doctorId: selectedDoctorId,
      serviceId: selectedServiceId,
      mode,
      date: selectedDate ? selectedDate.toISOString() : null,
      time: selectedTime,
      patient: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: `+996 ${phone.trim()}`,
        email: email.trim() || null,
        comment: comment.trim() || null,
      },
    };

    console.log("Record payload:", payload);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
    }, 3000);
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
    activeModal,
    searchQuery,
    setSearchQuery,
    modalDraftSelection,
    setModalDraftSelection,
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
    canUseOnline,
    clinicMap,
    selectedClinic,
    selectedDoctor,
    selectedService,
    isStep2Complete,
    modalConfig,
    filteredModalItems,
    mobileStep1Config,
    filteredMobileStep1Items,
    handleMobileStep1Select,
    handleMobileStep1Continue,
    handleRecordBack,
    openModal,
    closeModal,
    applyModalSelection,
    validateAndSubmit,
  };
};

export type RecordForm = ReturnType<typeof useRecordForm>;
