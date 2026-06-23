"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { Button, IconBtn, Input, SearchInput, Textarea } from "@/shared";
import { Header } from "@/widgets";
import { useQuery } from "@tanstack/react-query";

import {
  AppointmentDateTimePicker,
  type ConsultationMode,
} from "@/features/appointment-datetime-picker";

import { api } from "@/shared/api/requests";
import { getServices } from "@/shared/api/services/requests";
import { HeaderBackIcon, RemoveIcon, SuccessCheckIcon } from "@/shared/assets";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/utils";

import { isEmailValid, isPhoneValid, normalizeLocalPhone } from "./model/lib";
import type {
  Clinic,
  Doctor,
  MobileSelectionStage,
  MobileStep,
  OptionalFormErrors,
  SelectionItem,
  SelectionModalType,
  Service,
} from "./model/types";
import { FieldLabel } from "./ui/FieldLabel";
import { MobileStepsProgress } from "./ui/MobileStepsProgress";
import { SelectField } from "./ui/SelectField";
import { SelectionListItem } from "./ui/SelectionListItem";
import { StepTitle } from "./ui/StepTitle";
import { SummaryCard } from "./ui/SummaryCard";

export const RecordPage = () => {
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

  // Services are already filtered server-side by selectedClinicId/selectedDoctorId
  const serviceOptions = SERVICES;

  const isStep1Complete =
    Boolean(selectedClinicId) &&
    Boolean(selectedDoctorId) &&
    Boolean(selectedServiceId);
  const isStep2Complete = Boolean(selectedDate) && Boolean(selectedTime);
  const isStep3Complete =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    isPhoneValid(phone) &&
    (!email || isEmailValid(email));

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

    if (activeModal === "clinic") {
      return {
        title: "Выберите клинику",
        searchPlaceholder: "Поиск клиники",
        items: CLINICS as SelectionItem[],
      };
    }

    if (activeModal === "doctor") {
      return {
        title: "Выберите специалиста",
        searchPlaceholder: "Поиск специалиста",
        items: doctorOptions as SelectionItem[],
      };
    }

    return {
      title: "Выберите услугу",
      searchPlaceholder: "Поиск услуги",
      items: serviceOptions as SelectionItem[],
    };
  }, [activeModal, CLINICS, doctorOptions, serviceOptions]);

  const filteredModalItems = useMemo(() => {
    if (!modalConfig) return [];

    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return modalConfig.items;

    return modalConfig.items.filter((item) => {
      if ("title" in item) {
        return (
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.category.toLowerCase().includes(normalizedQuery)
        );
      }

      if ("specialty" in item) {
        return (
          item.name.toLowerCase().includes(normalizedQuery) ||
          item.specialty.toLowerCase().includes(normalizedQuery)
        );
      }

      return (
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.address.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [modalConfig, searchQuery]);

  const mobileStep1Config = useMemo(() => {
    if (mobileSelectionStage === "clinic") {
      return {
        title: "Выберите клинику",
        searchPlaceholder: "Поиск клиники",
        items: CLINICS as SelectionItem[],
        selectedId: selectedClinicId,
      };
    }

    if (mobileSelectionStage === "doctor") {
      return {
        title: "Выберите специалиста",
        searchPlaceholder: "Поиск специалиста",
        items: doctorOptions as SelectionItem[],
        selectedId: selectedDoctorId,
      };
    }

    return {
      title: "Выберите услугу",
      searchPlaceholder: "Поиск услуги",
      items: serviceOptions as SelectionItem[],
      selectedId: selectedServiceId,
    };
  }, [
    mobileSelectionStage,
    selectedClinicId,
    selectedDoctorId,
    selectedServiceId,
    CLINICS,
    doctorOptions,
    serviceOptions,
  ]);

  const filteredMobileStep1Items = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return mobileStep1Config.items;

    return mobileStep1Config.items.filter((item) => {
      if ("title" in item) {
        return (
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.category.toLowerCase().includes(normalizedQuery)
        );
      }

      if ("specialty" in item) {
        return (
          item.name.toLowerCase().includes(normalizedQuery) ||
          item.specialty.toLowerCase().includes(normalizedQuery)
        );
      }

      return (
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.address.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [mobileStep1Config.items, searchQuery]);

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

  return (
    <main className="min-h-screen bg-background lg:bg-white flex flex-col">
      <Header
        title="Оформление записи"
        backTo={ROUTES.HOME}
        onBack={handleRecordBack}
      >
        <MobileStepsProgress currentStep={mobileStep} totalSteps={3} />
      </Header>

      <div className="hidden lg:block w-full max-w-340 mx-auto px-10 pt-6">
        <div className="flex items-center gap-3">
          <IconBtn variant="outline" size="sm" onClick={() => router.back()}>
            <HeaderBackIcon className="size-4" />
          </IconBtn>
          <h1 className="text-[28px] font-semibold text-foreground leading-[130%]">
            Оформление записи
          </h1>
        </div>
      </div>

      <div className="w-full max-w-340 mx-auto px-4 lg:px-10 py-4 lg:py-6 pb-10 flex-1">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-6">
          <div className="rounded-3xl border border-border-soft bg-white overflow-hidden">
            <section
              className={cn(
                "p-4 lg:p-6",
                mobileStep !== 1 && "hidden",
                "lg:block",
              )}
            >
              <div className="hidden lg:block">
                <StepTitle number={1} title="Выберите" />

                <div className="space-y-3 max-w-full lg:max-w-75">
                  <SelectField
                    label="Клиника"
                    value={selectedClinic?.name}
                    placeholder="Выберите из списка"
                    onClick={() => openModal("clinic")}
                  />

                  <SelectField
                    label="Специалист"
                    value={selectedDoctor?.name}
                    placeholder="Выберите из списка"
                    onClick={() => openModal("doctor")}
                  />

                  <SelectField
                    label="Услуга"
                    value={selectedService?.title}
                    placeholder="Выберите из списка"
                    onClick={() => openModal("service")}
                  />
                </div>
              </div>

              <div className="lg:hidden">
                <h2 className="text-[40px] text-foreground leading-none font-semibold">
                  {mobileStep1Config.title}
                </h2>

                <div className="mt-3">
                  <SearchInput
                    placeholder={mobileStep1Config.searchPlaceholder}
                    value={searchQuery}
                    onChange={setSearchQuery}
                  />
                </div>

                <div className="mt-3 max-h-[52vh] overflow-y-auto pr-1 space-y-2">
                  {filteredMobileStep1Items.length > 0 ? (
                    filteredMobileStep1Items.map((item) => (
                      <SelectionListItem
                        key={item.id}
                        item={item}
                        clinicMap={clinicMap}
                        compact
                        selected={mobileStep1Config.selectedId === item.id}
                        onSelect={() => handleMobileStep1Select(item.id)}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-muted text-center py-6">
                      Ничего не найдено
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#E9EBEE]">
                  <Button
                    className="w-full justify-center"
                    size="lg"
                    disabled={!mobileStep1Config.selectedId}
                    onClick={handleMobileStep1Continue}
                  >
                    Продолжить
                  </Button>
                </div>
              </div>
            </section>

            <section
              className={cn(
                "p-4 lg:p-6 lg:border-t lg:border-border-soft",
                mobileStep !== 2 && "hidden",
                "lg:block",
              )}
            >
              <StepTitle number={2} title="Выберите дату и время" />

              <AppointmentDateTimePicker
                mode={mode}
                onModeChange={setMode}
                canUseOnline={canUseOnline}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                selectedTime={selectedTime}
                onTimeChange={setSelectedTime}
                isDateDisabled={(date) => {
                  const now = new Date();
                  const startOfToday = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                  );
                  return date < startOfToday;
                }}
              />

              <div className="lg:hidden mt-6">
                <Button
                  className="w-full justify-center"
                  size="lg"
                  onClick={() => {
                    if (!isStep2Complete) return;
                    setMobileStep(3);
                  }}
                >
                  Продолжить
                </Button>
              </div>
            </section>

            <section
              className={cn(
                "p-4 lg:p-6 lg:border-t lg:border-border-soft",
                mobileStep !== 3 && "hidden",
                "lg:block",
              )}
            >
              <StepTitle number={3} title="Заполните данные" />

              <div className="grid gap-3 lg:grid-cols-2">
                <Input
                  label="Имя"
                  placeholder="Введите ваше имя"
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(event.target.value);
                    setErrors((prev) => ({ ...prev, firstName: undefined }));
                  }}
                  error={errors.firstName}
                />

                <Input
                  label="Введите фамилию"
                  placeholder="Введите вашу фамилию"
                  value={lastName}
                  onChange={(event) => {
                    setLastName(event.target.value);
                    setErrors((prev) => ({ ...prev, lastName: undefined }));
                  }}
                  error={errors.lastName}
                />

                <div className="space-y-1.5">
                  <span className="text-sm font-medium text-overlay">
                    Номер телефона
                  </span>
                  <div
                    className={cn(
                      "flex items-center h-11 rounded-lg border transition-all overflow-hidden",
                      errors.phone
                        ? "border-red-400"
                        : "border-border-soft focus-within:border-primary/60",
                    )}
                  >
                    <span className="px-3 h-full flex items-center bg-[#F7F8F9] border-r border-border-soft text-sm text-foreground select-none shrink-0">
                      +996
                    </span>
                    <input
                      type="tel"
                      placeholder="000 000 000"
                      value={phone}
                      onChange={(event) => {
                        setPhone(normalizeLocalPhone(event.target.value));
                        setErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      onBlur={() => {
                        if (!phone) return;
                        setErrors((prev) => ({
                          ...prev,
                          phone: isPhoneValid(phone)
                            ? undefined
                            : "Проверьте формат номера",
                        }));
                      }}
                      className="flex-1 h-full px-3 text-sm text-foreground outline-none bg-transparent placeholder:text-muted"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <FieldLabel
                    label="Электронная почта"
                    hint="Необязательное поле"
                  />
                  <Input
                    placeholder="Введите вашу почту"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    error={errors.email}
                  />
                </div>

                <div className="lg:col-span-2 max-w-full lg:max-w-75">
                  <FieldLabel label="Комментарий" hint="Необязательное поле" />
                  <Textarea
                    rows={4}
                    placeholder="Введите ваш комментарий"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6">
                <Button
                  className="w-full lg:w-auto lg:min-w-50 justify-center"
                  size="lg"
                  disabled={isSubmitting}
                  onClick={validateAndSubmit}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin size-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Отправка...
                    </span>
                  ) : (
                    "Продолжить"
                  )}
                </Button>
              </div>
            </section>
          </div>

          <div className="hidden lg:block">
            {selectedDoctor && selectedService && (
              <SummaryCard
                doctor={selectedDoctor}
                service={selectedService}
                mode={mode}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
              />
            )}
          </div>
        </div>
      </div>

      {modalConfig && (
        <div className="fixed inset-0 z-50 bg-overlay/40 backdrop-blur-[2px] flex items-center justify-center p-3">
          <div className="w-full max-w-138 rounded-3xl border border-border-soft bg-white p-4 lg:p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[28px] text-foreground leading-[130%] font-semibold">
                {modalConfig.title}
              </h3>

              <IconBtn
                variant="outline"
                size="sm"
                onClick={closeModal}
                aria-label="Закрыть"
              >
                <RemoveIcon className="size-4" />
              </IconBtn>
            </div>

            <div className="mt-4">
              <SearchInput
                placeholder={modalConfig.searchPlaceholder}
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>

            <div className="mt-3 max-h-95 overflow-y-auto pr-1 space-y-2">
              {filteredModalItems.length > 0 ? (
                filteredModalItems.map((item) => (
                  <SelectionListItem
                    key={item.id}
                    item={item}
                    clinicMap={clinicMap}
                    selected={modalDraftSelection === item.id}
                    onSelect={() => setModalDraftSelection(item.id)}
                  />
                ))
              ) : (
                <p className="text-sm text-muted text-center py-6">
                  Ничего не найдено
                </p>
              )}
            </div>

            <div className="mt-4">
              <Button
                className="w-full justify-center"
                size="lg"
                disabled={!modalDraftSelection}
                onClick={applyModalSelection}
              >
                Выбрать
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 bg-overlay/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-border-soft p-8 max-w-sm w-full flex flex-col items-center text-center gap-5">
            <SuccessCheckIcon className="size-50" />
            <div>
              <p className="text-[20px] font-semibold text-foreground leading-[130%]">
                Ваша запись
                <br />
                успешно забронирована!
              </p>
              <p className="text-sm text-secondary mt-2">
                Ожидайте сообщение от вашего специалиста
              </p>
            </div>
            <Button
              className="w-full justify-center"
              onClick={() => setShowSuccess(false)}
            >
              Спасибо
            </Button>
          </div>
        </div>
      )}
    </main>
  );
};
