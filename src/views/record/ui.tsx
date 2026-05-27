"use client";

import { FC, useEffect, useMemo, useState } from "react";

import Image, { StaticImageData } from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { Button, IconBtn, Input, SearchInput, Textarea } from "@/shared";
import { Header } from "@/widgets";

import {
  AppointmentDateTimePicker,
  type ConsultationMode,
} from "@/features/appointment-datetime-picker";

import {
  MOCK_CLINICS,
  MOCK_DOCTORS,
  MOCK_SERVICES,
} from "@/shared/api/mock-data";
import {
  CalendarIcon,
  DropdownArrowIcon,
  GeoIcon,
  HeaderBackIcon,
  RemoveIcon,
  StarIcon,
  SuccessCheckIcon,
} from "@/shared/assets";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/utils";

type SelectionModalType = "clinic" | "doctor" | "service" | null;
type MobileStep = 1 | 2 | 3;
type MobileSelectionStage = "clinic" | "doctor" | "service";

type Clinic = {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  experience: number;
  address: string;
  image: StaticImageData | string;
};

type Doctor = {
  id: string;
  clinicId: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: number;
  image: StaticImageData | string;
};

type Service = {
  id: string;
  clinicId: string;
  doctorIds: string[];
  title: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: StaticImageData | string;
};

type SelectionItem = Clinic | Doctor | Service;

type OptionalFormErrors = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
};

const CLINICS: Clinic[] = MOCK_CLINICS.map((c) => ({
  id: c.id,
  name: c.name,
  rating: c.rating,
  reviews: c.reviews,
  experience: c.experience,
  address: c.address,
  image: c.image ?? "",
}));

const DOCTORS: Doctor[] = MOCK_DOCTORS.map((d) => ({
  id: String(d.id),
  clinicId: d.workplaces[0]?.clinicId ?? "",
  name: d.name,
  specialty: d.specialty,
  rating: d.rating,
  reviews: d.reviews,
  experience: d.experience,
  image: d.image ?? "",
}));

const SERVICES: Service[] = MOCK_SERVICES.map((s) => ({
  id: s.id,
  clinicId: s.clinicId,
  doctorIds: s.doctorIds,
  title: s.name,
  category: s.category,
  price: s.price,
  rating: s.rating,
  reviews: s.reviews,
  image: s.image ?? "",
}));

const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const formatDateLabel = (date: Date) =>
  `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}, ${date.getFullYear()}`;

const formatPrice = (price: number) => `${price} c`;

const normalizeLocalPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  return digits.replace(/(\d{3})(\d{3})?(\d{3})?/, (_, a, b, c) =>
    [a, b, c].filter(Boolean).join(" "),
  );
};

const isPhoneLocalValid = (local: string) =>
  local.replace(/\s/g, "").length === 9;

const isPhoneValid = (value: string) => {
  return isPhoneLocalValid(value);
};

const isEmailValid = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.toLowerCase());

const FieldLabel = ({ label, hint }: { label: string; hint?: string }) => (
  <div className="flex items-center justify-between gap-3 mb-1.5">
    <span className="text-[#0D0D12] text-sm font-medium">{label}</span>
    {hint && <span className="text-xs text-[#838A8D]">{hint}</span>}
  </div>
);

const StepTitle = ({ number, title }: { number: number; title: string }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <span className="size-7 rounded-full border border-[#F5653E] text-[#F5653E] text-sm flex items-center justify-center">
      {number}
    </span>
    <h2 className="text-[28px] text-[#191A1B] leading-[130%] font-semibold">
      {title}
    </h2>
  </div>
);

const MobileStepsProgress = ({
  currentStep,
  totalSteps,
}: {
  currentStep: MobileStep;
  totalSteps: number;
}) => {
  const progress =
    totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="mt-1 px-1">
      <div className="relative">
        <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-px bg-[#D3D7DA]" />
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 h-px bg-[#F5653E] transition-all duration-500 ease-out"
          style={{ width: `calc((100% - 24px) * ${progress / 100})` }}
        />

        <div className="relative flex items-center justify-between">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isDone = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <span
                key={stepNumber}
                className={cn(
                  "size-6 rounded-full border text-xs flex items-center justify-center transition-colors duration-300 bg-white",
                  isDone || isCurrent
                    ? "border-[#F5653E] text-[#F5653E]"
                    : "border-[#C8CDD1] text-[#A2A9AE]",
                )}
              >
                {stepNumber}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SelectField = ({
  label,
  value,
  placeholder,
  disabled,
  onClick,
}: {
  label: string;
  value?: string;
  placeholder: string;
  disabled?: boolean;
  onClick: () => void;
}) => (
  <div className="space-y-1.5">
    <span className="text-sm font-medium text-[#0D0D12]">{label}</span>
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full h-11 rounded-lg border border-[#E3E4E5] px-3 text-left flex items-center justify-between transition-all",
        "focus-visible:outline-none focus-visible:shadow-[0_0_1px_3px_rgba(245,101,62,0.3)]",
        !disabled && "hover:border-[#F5653E]/40",
        disabled && "bg-[#F7F8F9] text-[#A6ACB0] cursor-not-allowed",
      )}
    >
      <span
        className={cn("text-sm", value ? "text-[#191A1B]" : "text-[#838A8D]")}
      >
        {value || placeholder}
      </span>
      <DropdownArrowIcon className="size-5 text-[#838A8D]" />
    </button>
  </div>
);

const SelectionListItem = ({
  item,
  clinicMap,
  selected,
  compact = false,
  onSelect,
}: {
  item: SelectionItem;
  clinicMap: Map<string, Clinic>;
  selected: boolean;
  compact?: boolean;
  onSelect: () => void;
}) => {
  const isClinic = "address" in item;
  const isDoctor = "specialty" in item;
  const isService = "category" in item;
  const itemTitle = isService ? item.title : item.name;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full border rounded-2xl flex items-start transition-colors",
        compact ? "p-2 gap-2" : "p-2.5 gap-2.5",
        selected
          ? "border-[#F5653E] bg-[#FFF8F5]"
          : "border-[#E3E4E5] hover:border-[#F5653E]/40",
      )}
    >
      <div
        className={cn(
          "relative rounded-xl overflow-hidden bg-[#F2F3F5] shrink-0",
          compact ? "size-16" : "size-20",
        )}
      >
        <Image src={item.image} alt={itemTitle} fill className="object-cover" />
      </div>

      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "font-medium text-[#191A1B] leading-snug truncate",
              compact ? "text-base" : "text-[26px]",
            )}
          >
            {itemTitle}
          </p>
          {isService && (
            <span
              className={cn(
                "font-semibold text-[#191A1B] leading-none shrink-0",
                compact ? "text-base" : "text-[24px]",
              )}
            >
              {formatPrice(item.price)}
            </span>
          )}
        </div>

        {isDoctor && (
          <p
            className={cn(
              "text-[#686F72] mt-1",
              compact ? "text-xs" : "text-sm",
            )}
          >
            {item.specialty}
            <span className="text-[#F5653E]">
              {" "}
              • {clinicMap.get(item.clinicId)?.name}
            </span>
          </p>
        )}

        {isService && (
          <p
            className={cn(
              "text-[#686F72] mt-1",
              compact ? "text-xs" : "text-sm",
            )}
          >
            {item.category}
            <span className="text-[#F5653E]">
              {" "}
              • {clinicMap.get(item.clinicId)?.name}
            </span>
          </p>
        )}

        <div
          className={cn(
            "flex items-center gap-1 mt-1 text-[#686F72]",
            compact ? "text-xs" : "text-sm",
          )}
        >
          <StarIcon className="size-4 text-[#F5653E]" />
          <span className="font-medium text-[#F5653E]">{item.rating}</span>
          <span>({item.reviews})</span>
          {(isClinic || isDoctor) && <span>• {item.experience} лет опыта</span>}
        </div>

        {isClinic && (
          <div
            className={cn(
              "flex items-center gap-1 mt-1 text-[#686F72]",
              compact ? "text-xs" : "text-sm",
            )}
          >
            <GeoIcon className="size-4 text-[#F5653E]" />
            <span className="truncate">{item.address}</span>
          </div>
        )}
      </div>

      <span className="size-6 rounded-full border shrink-0 mt-1 border-[#D4D8DB] flex items-center justify-center">
        {selected && <span className="size-3.5 rounded-full bg-[#F5653E]" />}
      </span>
    </button>
  );
};

const SummaryCard: FC<{
  doctor: Doctor;
  service: Service;
  mode: ConsultationMode;
  selectedDate: Date | null;
  selectedTime: string | null;
}> = ({ doctor, service, mode, selectedDate, selectedTime }) => {
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckStatus = () => {
    setIsChecking(true);
    setTimeout(() => setIsChecking(false), 3000);
  };

  return (
    <aside className="relative border border-[#E3E4E5] rounded-3xl bg-white overflow-hidden lg:sticky lg:top-6 flex flex-col lg:w-100 lg:h-128.75">
      {/* Loading overlay */}
      {isChecking && (
        <div className="absolute inset-0 z-10 bg-white/70 rounded-3xl flex items-center justify-center">
          <svg
            className="animate-spin size-10 text-[#F5653E]"
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
        </div>
      )}

      <div className="relative h-64 lg:flex-1 bg-[#FFF8F5]">
        <Image
          src={doctor.image}
          alt={doctor.name}
          fill
          className="object-cover object-[center_20%]"
          sizes="(max-width: 768px) 100vw, 400px"
        />
      </div>

      <div className="p-3 shrink-0">
        <p className="text-base font-semibold text-[#191A1B] text-center leading-snug mt-2">
          {doctor.name}
        </p>
        <p className="text-sm text-[#686F72] text-center mt-0.5">
          {doctor.specialty}
        </p>

        <div className="mt-3 border border-[#E3E4E5] rounded-2xl p-3">
          <p className="text-sm font-medium text-[#191A1B]">{service.title}</p>
          <p className="text-sm text-[#686F72] mt-0.5">
            {mode === "online" ? "Онлайн-консультация" : "Оффлайн-консультация"}
          </p>
          <div className="flex items-center gap-1.5 text-sm text-[#686F72] mt-1">
            <CalendarIcon className="size-4 shrink-0" />
            <span>
              {selectedDate && selectedTime
                ? `${formatDateLabel(selectedDate)} • ${selectedTime}`
                : "Дата и время не выбраны"}
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm text-[#686F72]">
            <span>К оплате</span>
            <span className="text-[#191A1B] font-semibold">
              {formatPrice(service.price)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-[#686F72]">
            <span>Статус</span>
            <span className="px-2.5 py-1 rounded-full bg-[#FFF3EE] text-[#F5653E] text-xs font-medium">
              Ожидает оплаты
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full justify-center mt-3 text-[#191A1B]"
          disabled={isChecking}
          onClick={handleCheckStatus}
        >
          Проверить статус
        </Button>
      </div>
    </aside>
  );
};

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

  useEffect(() => {
    const serviceId = urlParams.get("service");
    if (!serviceId) return;
    const service = SERVICES.find((s) => s.id === serviceId);
    if (!service) return;
    setSelectedServiceId(serviceId);
    setSelectedClinicId(service.clinicId);
    setSelectedDoctorId(service.doctorIds[0] ?? null);
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
    [],
  );

  const selectedClinic = useMemo(
    () => CLINICS.find((clinic) => clinic.id === selectedClinicId) ?? null,
    [selectedClinicId],
  );
  const selectedDoctor = useMemo(
    () => DOCTORS.find((doctor) => doctor.id === selectedDoctorId) ?? null,
    [selectedDoctorId],
  );
  const selectedService = useMemo(
    () => SERVICES.find((service) => service.id === selectedServiceId) ?? null,
    [selectedServiceId],
  );

  const doctorOptions = useMemo(
    () =>
      DOCTORS.filter(
        (doctor) => !selectedClinicId || doctor.clinicId === selectedClinicId,
      ),
    [selectedClinicId],
  );

  const serviceOptions = useMemo(
    () =>
      SERVICES.filter((service) => {
        const matchesClinic =
          !selectedClinicId || service.clinicId === selectedClinicId;
        const matchesDoctor =
          !selectedDoctorId || service.doctorIds.includes(selectedDoctorId);

        return matchesClinic && matchesDoctor;
      }),
    [selectedClinicId, selectedDoctorId],
  );

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
    const matchedService = SERVICES.find((service) => service.id === serviceId);
    if (!matchedService) return;

    setSelectedServiceId(serviceId);

    if (selectedClinicId !== matchedService.clinicId) {
      setSelectedClinicId(matchedService.clinicId);
    }
    if (
      !selectedDoctorId ||
      !matchedService.doctorIds.includes(selectedDoctorId)
    ) {
      setSelectedDoctorId(matchedService.doctorIds[0] ?? null);
    }
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
  }, [activeModal, doctorOptions, serviceOptions]);

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
    <main className="min-h-screen bg-[#F2F3F5] lg:bg-white flex flex-col">
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
          <h1 className="text-[28px] font-semibold text-[#191A1B] leading-[130%]">
            Оформление записи
          </h1>
        </div>
      </div>

      <div className="w-full max-w-340 mx-auto px-4 lg:px-10 py-4 lg:py-6 pb-10 flex-1">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-6">
          <div className="rounded-3xl border border-[#E3E4E5] bg-white overflow-hidden">
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
                <h2 className="text-[40px] text-[#191A1B] leading-none font-semibold">
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
                    <p className="text-sm text-[#838A8D] text-center py-6">
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
                "p-4 lg:p-6 lg:border-t lg:border-[#E3E4E5]",
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
                "p-4 lg:p-6 lg:border-t lg:border-[#E3E4E5]",
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
                  <span className="text-sm font-medium text-[#0D0D12]">
                    Номер телефона
                  </span>
                  <div
                    className={cn(
                      "flex items-center h-11 rounded-lg border transition-all overflow-hidden",
                      errors.phone
                        ? "border-red-400"
                        : "border-[#E3E4E5] focus-within:border-[#F5653E]/60",
                    )}
                  >
                    <span className="px-3 h-full flex items-center bg-[#F7F8F9] border-r border-[#E3E4E5] text-sm text-[#191A1B] select-none shrink-0">
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
                      className="flex-1 h-full px-3 text-sm text-[#191A1B] outline-none bg-transparent placeholder:text-[#838A8D]"
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
        <div className="fixed inset-0 z-50 bg-[#0D0D12]/40 backdrop-blur-[2px] flex items-center justify-center p-3">
          <div className="w-full max-w-138 rounded-3xl border border-[#E3E4E5] bg-white p-4 lg:p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[28px] text-[#191A1B] leading-[130%] font-semibold">
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
                <p className="text-sm text-[#838A8D] text-center py-6">
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
        <div className="fixed inset-0 z-50 bg-[#0D0D12]/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E3E4E5] p-8 max-w-sm w-full flex flex-col items-center text-center gap-5">
            <SuccessCheckIcon className="size-50" />
            <div>
              <p className="text-[20px] font-semibold text-[#191A1B] leading-[130%]">
                Ваша запись
                <br />
                успешно забронирована!
              </p>
              <p className="text-sm text-[#686F72] mt-2">
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
