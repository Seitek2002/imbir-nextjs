"use client";

import { JSX, useEffect, useState } from "react";
import toast from "react-hot-toast";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { Footer, Header } from "@/widgets";

import {
  registerClientFn,
  registerClinicFn,
  registerDoctorFn,
} from "@/shared/api/auth/requests";
import { getClinicById } from "@/shared/api/clinics/requests";
import {
  EmailIcon,
  EyeIcon,
  EyeOffIcon,
  HeaderBackIcon,
  ProfileIcon,
} from "@/shared/assets";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/shared/store/authStore";
import { Button, IconBtn, Input } from "@/shared/ui";
import { SegmentedControl } from "@/shared/ui/segmented-control/ui";

import {
  ClinicFormData,
  ClinicRegistrationForm,
  ClinicStep,
} from "./clinic-form";
import {
  DoctorFormData,
  DoctorRegistrationForm,
  DoctorStep,
  InviteClinic,
} from "./doctor-form";

// --- Role icons ---

const ClinicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 10L12 3l9 7v10a1 1 0 01-1 1H4a1 1 0 01-1-1V10z"
      stroke="#F5653E"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M9 21V14h6v7"
      stroke="#F5653E"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.5 9.5h3M12 8v3"
      stroke="#F5653E"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const DoctorIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="7" r="4" stroke="#F5653E" strokeWidth="1.5" />
    <path
      d="M4 20c0-3.314 3.134-6 8-6"
      stroke="#F5653E"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="18.5" cy="18.5" r="2.5" stroke="#F5653E" strokeWidth="1.5" />
    <path
      d="M17 18.5h3M18.5 17v3"
      stroke="#F5653E"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const ClientIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke="#F5653E" strokeWidth="1.5" />
    <path
      d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8"
      stroke="#F5653E"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// --- Types ---

type Role = "clinic" | "doctor" | "client";
type ActiveForm = "role" | "client" | "doctor" | "clinic";

type RoleOption = {
  value: Role;
  label: string;
  description: string;
  Icon: () => JSX.Element;
};

const ROLES: RoleOption[] = [
  {
    value: "clinic",
    label: "Клиника",
    description: "Для медицинских учреждений",
    Icon: ClinicIcon,
  },
  {
    value: "doctor",
    label: "Врач",
    description: "Для медицинских специалистов",
    Icon: DoctorIcon,
  },
  {
    value: "client",
    label: "Клиент",
    description: "Для пациентов и их родственников",
    Icon: ClientIcon,
  },
];

// --- Component ---

const ROLE_REDIRECT: Record<string, string> = {
  patient: "/profile",
  doctor: "/doctor-profile",
  clinic: "/clinic-profile",
};

export const RegisterPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens, setUser } = useAuthStore();

  const [authMode, setAuthMode] = useState<string>("register");
  const [activeForm, setActiveForm] = useState<ActiveForm>("role");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [inviteClinic, setInviteClinic] = useState<InviteClinic | undefined>();

  useEffect(() => {
    const clinicId = searchParams.get("clinicId");
    if (!clinicId) return;
    const branchId = searchParams.get("branchId");
    getClinicById(clinicId)
      .then((clinic) => {
        const branch = branchId
          ? clinic.branches?.find((b) => b.id === branchId)
          : null;
        setInviteClinic({
          clinicId: String(clinic.id),
          clinicName: clinic.name,
          branchId: branchId ?? null,
          branchAddress: branch?.address ?? clinic.address ?? "",
        });
        setSelectedRole("doctor");
        setActiveForm("doctor");
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client form
  const [clientStep, setClientStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isLoadingClient, setIsLoadingClient] = useState(false);

  // Doctor form step (owned here for unified back navigation)
  const [doctorStep, setDoctorStep] = useState<DoctorStep>(1);

  // Clinic form step
  const [clinicStep, setClinicStep] = useState<ClinicStep>(1);
  const [isLoadingClinic, setIsLoadingClinic] = useState(false);
  const [isLoadingDoctor, setIsLoadingDoctor] = useState(false);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "confirmPassword" || field === "password")
      setPasswordError("");
  };

  const handleBack = () => {
    if (activeForm === "role") {
      router.back();
    } else if (activeForm === "client") {
      if (clientStep === 1) {
        setActiveForm("role");
      } else {
        setClientStep(1);
      }
    } else if (activeForm === "doctor") {
      if (doctorStep === 1) {
        setActiveForm("role");
        setDoctorStep(1);
      } else {
        setDoctorStep((s) => (s - 1) as DoctorStep);
      }
    } else if (activeForm === "clinic") {
      if (clinicStep === 1) {
        setActiveForm("role");
        setClinicStep(1);
      } else {
        setClinicStep((s) => (s - 1) as ClinicStep);
      }
    } else {
      setActiveForm("role");
    }
  };

  const handleContinueRole = () => {
    if (!selectedRole) return;
    setActiveForm(selectedRole);
  };

  const handleSubmitClient = async () => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Пароли не совпадают");
      return;
    }
    setIsLoadingClient(true);
    try {
      const res = await registerClientFn({
        first_name: formData.name,
        last_name: formData.surname,
        email: formData.email,
        password: formData.password,
        phone: "",
      });
      setTokens({ access: res.access, refresh: res.refresh });
      setUser(res.user);
      toast.success(`Добро пожаловать, ${res.user.first_name}!`);
      router.push(ROLE_REDIRECT[res.user.role] ?? "/profile");
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string[]> } })
        ?.response?.data;
      const msg = data
        ? Object.values(data).flat()[0]
        : "Ошибка регистрации. Попробуйте снова";
      toast.error(msg);
    } finally {
      setIsLoadingClient(false);
    }
  };

  const handleSubmitDoctor = async (data: DoctorFormData) => {
    setIsLoadingDoctor(true);
    try {
      const emptyDay = { from: null, to: null, enabled: false };
      const res = await registerDoctorFn({
        invite_clinic_id: inviteClinic?.clinicId,
        invite_branch_id: inviteClinic?.branchId ?? undefined,
        password: data.password,
        step1: {
          full_name: data.fullName,
          gender: data.gender as "male" | "female",
          birth_date: data.birthDate,
          city: data.city,
          languages: data.languages,
          phone: data.phone,
          email: data.email,
          photo: data.photo ?? undefined,
        },
        step2: {
          country: "kg",
          city: data.city,
          address: "",
          phone: data.phone,
          email: data.email,
        },
        step3: {
          schedule: {
            monday: emptyDay,
            tuesday: emptyDay,
            wednesday: emptyDay,
            thursday: emptyDay,
            friday: emptyDay,
            saturday: emptyDay,
            sunday: emptyDay,
          },
          lunch_break: { from: "", to: "" },
          emergency_24_7: false,
        },
        step4: {
          legal_name: data.fullName,
          reg_number: "",
          license_number: data.licenseNumber,
          license_date: "",
          license_authority: "",
          documents:
            data.certificates.length > 0 ? data.certificates : undefined,
        },
        step5: {
          primary_specializations: data.specialization
            ? [data.specialization]
            : [],
          narrow_specializations: data.additionalSpecialization
            ? [data.additionalSpecialization]
            : [],
          additional_services: data.position || undefined,
        },
        step6: { equipment: [], patient_conditions: [], payment_methods: [] },
        step7: {
          agree_terms: true,
          agree_privacy: true,
          agree_data_processing: true,
          agree_publishing: true,
        },
      });
      setTokens({ access: res.access, refresh: res.refresh });
      setUser(res.user);
      toast.success(`Добро пожаловать, ${res.user.first_name}!`);
      router.push(ROLE_REDIRECT[res.user.role] ?? "/doctor-profile");
    } catch (err: unknown) {
      const errData = (
        err as { response?: { data?: Record<string, string[]> } }
      )?.response?.data;
      const msg = errData
        ? Object.values(errData).flat()[0]
        : "Ошибка регистрации. Попробуйте снова";
      toast.error(msg);
    } finally {
      setIsLoadingDoctor(false);
    }
  };

  const handleSubmitClinic = async (data: ClinicFormData) => {
    setIsLoadingClinic(true);
    try {
      const toApiDate = (ddmmyyyy: string): string => {
        const [dd, mm, yyyy] = ddmmyyyy.split(".");
        if (!dd || !mm || !yyyy) return ddmmyyyy;
        return `${yyyy}-${mm}-${dd}`;
      };
      const toDay = (d: { from: string; to: string }) => ({
        from: d.from || null,
        to: d.to || null,
        enabled: !!(d.from && d.to),
      });
      const res = await registerClinicFn({
        password: data.password,
        step1: {
          name: data.clinicName,
          logo: data.logo ?? undefined,
          type: data.clinicType,
          description: data.description,
          photos: data.photos.length > 0 ? data.photos : undefined,
        },
        step2: {
          country: data.country,
          city: data.city,
          address: data.fullAddress,
          phone: data.phone,
          email: data.email,
          website: data.website || undefined,
        },
        step3: {
          schedule: {
            monday: toDay(data.schedule.mon),
            tuesday: toDay(data.schedule.tue),
            wednesday: toDay(data.schedule.wed),
            thursday: toDay(data.schedule.thu),
            friday: toDay(data.schedule.fri),
            saturday: toDay(data.schedule.sat),
            sunday: toDay(data.schedule.sun),
          },
          lunch_break: { from: data.lunchBreak.from, to: data.lunchBreak.to },
          emergency_24_7: data.emergency247,
        },
        step4: {
          legal_name: data.legalName,
          reg_number: data.registrationNumber,
          license_number: data.licenseNumber,
          license_date: toApiDate(data.licenseDate),
          license_authority: data.licensingAuthority,
          documents: data.documents.length > 0 ? data.documents : undefined,
        },
        step5: {
          primary_specializations: data.mainDirections
            .split(/[,.]/)
            .map((s) => s.trim())
            .filter(Boolean),
          narrow_specializations: data.narrowDirections
            .split(/[,.]/)
            .map((s) => s.trim())
            .filter(Boolean),
          additional_services: data.additionalServices || undefined,
        },
        step6: {
          equipment: data.equipment,
          patient_conditions: data.patientConditions,
          payment_methods: data.paymentMethods,
        },
        step7: {
          agree_terms: data.agreeRules,
          agree_privacy: data.agreePrivacy,
          agree_data_processing: data.agreeDataProcessing,
          agree_publishing: data.agreeAccuracy,
        },
      });
      setTokens({ access: res.access, refresh: res.refresh });
      setUser(res.user);
      toast.success(`Добро пожаловать, ${data.clinicName}!`);
      router.push(ROLE_REDIRECT[res.user.role] ?? "/clinic-profile");
    } catch (err: unknown) {
      const errData = (
        err as { response?: { data?: Record<string, string[]> } }
      )?.response?.data;
      const msg = errData
        ? Object.values(errData).flat()[0]
        : "Ошибка регистрации. Попробуйте снова";
      toast.error(msg);
    } finally {
      setIsLoadingClinic(false);
    }
  };

  const AuthTabs = (
    <SegmentedControl
      options={[
        { label: "Вход", value: "login" },
        { label: "Регистрация", value: "register" },
      ]}
      value={authMode}
      onChange={(val) => {
        setAuthMode(val);
        if (val === "login") router.push(ROUTES.LOGIN);
      }}
    />
  );

  return (
    <main className="min-h-screen bg-[#F2F3F5] flex flex-col">
      <Header onBack={handleBack}>{AuthTabs}</Header>

      <div className="flex-1 w-full max-w-360 md:max-w-340 mx-auto px-4 md:px-10 flex flex-col md:flex-row md:gap-10 pt-4 md:pt-16 pb-10">
        {/* Left decorative panel — desktop only */}
        <div className="hidden md:block md:w-1/2 shrink-0 self-start sticky top-8">
          <div className="rounded-2xl bg-[#FEF3F0] overflow-hidden flex items-center justify-center">
            <div className="relative w-full aspect-square">
              <Image
                src="/assets/auth-bg.png"
                fill
                alt="Imbir"
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Right form card */}
        <div className="flex-1 md:bg-white md:rounded-2xl md:p-10 md:pb-16 flex flex-col max-w-120 md:max-w-none mx-auto w-full">
          <div className="md:contents bg-white rounded-2xl m-2 p-4 md:p-0 flex-1 flex flex-col">
            {/* Desktop: back button + auth tabs */}
            <div className="hidden md:flex items-center gap-4">
              <IconBtn variant="outline" size="sm" onClick={handleBack}>
                <HeaderBackIcon className="size-4" />
              </IconBtn>
              <div className="flex-1 flex justify-center">{AuthTabs}</div>
              <div className="size-9" />
            </div>

            {/* Step: role selection */}
            {activeForm === "role" && (
              <>
                <div className="mt-8 mb-6 md:mt-12">
                  <h2 className="text-2xl font-semibold text-[#191A1B] mb-2">
                    Выберите свою роль
                  </h2>
                  <p className="text-[#838A8D] text-sm md:text-base">
                    Выберите вашу роль для продолжения регистрации
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {ROLES.map(({ value, label, description, Icon }) => (
                    <label
                      key={value}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer",
                        selectedRole === value
                          ? "border-[#F5653E] bg-[#FFF8F6]"
                          : "border-[#E5E6E8] bg-white hover:border-[#F5653E]/40",
                      )}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={value}
                        checked={selectedRole === value}
                        onChange={() => setSelectedRole(value)}
                        className="sr-only"
                      />
                      <div className="shrink-0 size-12 rounded-full bg-[#FEF3F0] flex items-center justify-center">
                        <Icon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#191A1B]">{label}</p>
                        <p className="text-sm text-[#838A8D]">{description}</p>
                      </div>
                      <div
                        className={cn(
                          "shrink-0 size-5 rounded-full border-4 transition-all flex items-center justify-center",
                          selectedRole === value
                            ? "border-[#F5653E]"
                            : "border-[#E3E4E5]",
                        )}
                      >
                        {selectedRole === value && (
                          <div className="size-2.5 rounded-full bg-[#F5653E]" />
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-auto pt-10 md:mt-10">
                  <Button
                    className="w-full justify-center md:h-14 md:text-lg"
                    size="lg"
                    onClick={handleContinueRole}
                    disabled={!selectedRole}
                  >
                    Продолжить
                  </Button>
                </div>
              </>
            )}

            {/* Doctor registration */}
            {activeForm === "doctor" && (
              <div className="mt-8 md:mt-12 flex-1 flex flex-col">
                {inviteClinic && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-[#FFF8F5] border border-[#FDDDD5] text-sm text-[#686F72]">
                    Вы приглашены клиникой{" "}
                    <span className="font-semibold text-[#191A1B]">
                      {inviteClinic.clinicName}
                    </span>
                    {inviteClinic.branchId && (
                      <> — {inviteClinic.branchAddress}</>
                    )}
                  </div>
                )}
                <DoctorRegistrationForm
                  step={doctorStep}
                  onContinue={() =>
                    setDoctorStep((s) => Math.min(s + 1, 4) as DoctorStep)
                  }
                  onSubmit={handleSubmitDoctor}
                  isLoading={isLoadingDoctor}
                  inviteClinic={inviteClinic}
                />
              </div>
            )}

            {/* Clinic registration */}
            {activeForm === "clinic" && (
              <div className="mt-8 md:mt-12 flex-1 flex flex-col">
                <ClinicRegistrationForm
                  step={clinicStep}
                  onContinue={() =>
                    setClinicStep((s) => Math.min(s + 1, 7) as ClinicStep)
                  }
                  onSubmit={handleSubmitClinic}
                  isLoading={isLoadingClinic}
                />
              </div>
            )}

            {/* Client registration */}
            {activeForm === "client" && (
              <>
                <div className="mt-8 mb-6 md:mt-12">
                  <h2 className="text-2xl font-semibold text-[#191A1B] mb-2">
                    Добро пожаловать в Imbir
                  </h2>
                  <p className="text-[#838A8D] text-sm md:text-base">
                    {clientStep === 1
                      ? "Заполните данные, чтобы создать аккаунт"
                      : "Придумайте и подтвердите пароль вашего аккаунта"}
                  </p>
                </div>

                {clientStep === 1 && (
                  <div className="flex flex-col gap-4">
                    <Input
                      label="Имя"
                      placeholder="Введите ваше имя"
                      IconRight={ProfileIcon}
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                    />
                    <Input
                      label="Фамилия"
                      placeholder="Введите вашу фамилию"
                      IconRight={ProfileIcon}
                      value={formData.surname}
                      onChange={(e) => handleChange("surname", e.target.value)}
                    />
                    <Input
                      label="Электронная почта"
                      type="email"
                      placeholder="Введите вашу почту"
                      IconRight={EmailIcon}
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>
                )}

                {clientStep === 2 && (
                  <div className="flex flex-col gap-4">
                    <Input
                      label="Пароль"
                      type={showPassword ? "text" : "password"}
                      placeholder="Введите пароль"
                      IconRight={showPassword ? EyeIcon : EyeOffIcon}
                      onIconRightClick={() => setShowPassword(!showPassword)}
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                    />
                    <Input
                      label="Подтвердите пароль"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Введите пароль повторно"
                      IconRight={showConfirm ? EyeIcon : EyeOffIcon}
                      onIconRightClick={() => setShowConfirm(!showConfirm)}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleChange("confirmPassword", e.target.value)
                      }
                      error={passwordError}
                    />
                  </div>
                )}

                <div className="mt-auto pt-10 md:mt-10 flex flex-col gap-3">
                  <Button
                    variant="outline"
                    className="w-full justify-center md:h-14 md:text-lg"
                    size="lg"
                    onClick={handleBack}
                  >
                    Назад
                  </Button>

                  {clientStep === 1 ? (
                    <Button
                      className="w-full justify-center md:h-14 md:text-lg"
                      size="lg"
                      onClick={() => setClientStep(2)}
                      disabled={
                        !formData.name || !formData.surname || !formData.email
                      }
                    >
                      Продолжить
                    </Button>
                  ) : (
                    <Button
                      className="w-full justify-center md:h-14 md:text-lg"
                      size="lg"
                      onClick={handleSubmitClient}
                      disabled={
                        !formData.password ||
                        !formData.confirmPassword ||
                        isLoadingClient
                      }
                      loading={isLoadingClient}
                    >
                      Создать аккаунт
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};
