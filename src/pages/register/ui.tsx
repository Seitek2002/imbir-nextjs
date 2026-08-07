"use client";

import { JSX, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useRouter, useSearchParams } from "next/navigation";

import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

import {
  resolveSpecializationIds,
  useSpecializations,
} from "@/entities/specialization";

import {
  getClinicById,
  registerClientFn,
  registerClinicFn,
  registerDoctorFn,
  registerPhoneConfirmFn,
  registerPhoneRequestFn,
  updateDoctorProfile,
} from "@/shared/api";
import {
  EmailIcon,
  EyeIcon,
  EyeOffIcon,
  HeaderBackIcon,
  ProfileIcon,
} from "@/shared/assets/icons";
import { ROUTES, colors } from "@/shared/config";
import { extractErrorMessage } from "@/shared/lib/errors";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/shared/store";
import { AuthShell, Button, IconBtn, Input, PhoneInput } from "@/shared/ui";
import { SegmentedControl } from "@/shared/ui/segmented-control";

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
      stroke={colors.primary}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path
      d="M9 21V14h6v7"
      stroke={colors.primary}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.5 9.5h3M12 8v3"
      stroke={colors.primary}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const DoctorIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="7" r="4" stroke={colors.primary} strokeWidth="1.5" />
    <path
      d="M4 20c0-3.314 3.134-6 8-6"
      stroke={colors.primary}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle
      cx="18.5"
      cy="18.5"
      r="2.5"
      stroke={colors.primary}
      strokeWidth="1.5"
    />
    <path
      d="M17 18.5h3M18.5 17v3"
      stroke={colors.primary}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const ClientIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={colors.primary} strokeWidth="1.5" />
    <path
      d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8"
      stroke={colors.primary}
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
    description: "Управляйте врачами, услугами и записями пациентов",
    Icon: ClinicIcon,
  },
  {
    value: "doctor",
    label: "Врач",
    description:
      "Управляйте расписанием, принимайте пациентов и ведите документацию",
    Icon: DoctorIcon,
  },
  {
    value: "client",
    label: "Пациент",
    description:
      "Записывайтесь к врачам, следите за приёмами и храните важные медицинские данные",
    Icon: ClientIcon,
  },
];

// --- Component ---

const ROLE_REDIRECT: Record<string, string> = {
  patient: "/profile",
  doctor: "/doctor-profile",
  clinic: "/clinic-profile",
};

const getRoleRedirect = (role: string): string => {
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches;

  if (role === "clinic" && isMobile) return "/clinic-profile/menu";
  return ROLE_REDIRECT[role] ?? "/profile";
};

// Поля дат вводятся как ДД.ММ.ГГГГ, бэк принимает только YYYY-MM-DD.
const toApiDate = (ddmmyyyy: string): string => {
  const [dd, mm, yyyy] = ddmmyyyy.split(".");
  if (!dd || !mm || !yyyy) return ddmmyyyy;
  return `${yyyy}-${mm}-${dd}`;
};

export const RegisterPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const { setTokens, setUser, setRememberMe } = useAuthStore();

  const [authMode, setAuthMode] = useState<string>("register");
  const [activeForm, setActiveForm] = useState<ActiveForm>("role");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [inviteClinic, setInviteClinic] = useState<InviteClinic | undefined>();

  // Dropdown/текстовые поля специализации хранят название (см.
  // useSpecializationOptions), а бэк на запись принимает только id — резолвим
  // перед отправкой, как и в профилях врача/клиники.
  const { data: specializationList = [] } = useSpecializations();

  useEffect(() => {
    const clinicId = searchParams.get("clinicId");
    if (!clinicId) return;
    const branchId = searchParams.get("branchId");

    // Привязка врача (invite_clinic_id) идёт по id из ссылки и не зависит от
    // того, опубликована ли клиника публично. Публичный /api/clinics/{id}/
    // нужен только чтобы КРАСИВО показать имя/адрес клиники — если он
    // недоступен (клиника ещё не опубликована), инвайт всё равно должен
    // сработать при сабмите, просто с нейтральным превью вместо названия.
    setInviteClinic({
      clinicId,
      clinicName: "Клиника",
      branchId: branchId ?? null,
      branchAddress: "",
    });
    setSelectedRole("doctor");
    setActiveForm("doctor");

    getClinicById(clinicId)
      .then((clinic) => {
        const branch = branchId
          ? clinic.branches?.find((b) => b.id === branchId)
          : null;
        setInviteClinic({
          clinicId,
          clinicName: clinic.name,
          branchId: branchId ?? null,
          branchAddress: branch?.address ?? clinic.address ?? "",
        });
      })
      .catch(() => {
        // Клиника не опубликована или недоступна для публичного просмотра —
        // оставляем нейтральное превью, заданное выше; сама привязка не блокируется.
      });
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

  const [clientAuthMethod, setClientAuthMethod] = useState<"email" | "phone">(
    "email",
  );
  const [phone, setPhone] = useState("");
  const [dialCode, setDialCode] = useState("+996");
  const [verificationCode, setVerificationCode] = useState("");
  const [timer, setTimer] = useState(0);
  const [isRequestingCode, setIsRequestingCode] = useState(false);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

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
        setVerificationCode("");
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

  const handleClientContinue = async () => {
    if (clientAuthMethod === "email") {
      setClientStep(2);
      return;
    }

    setIsRequestingCode(true);
    try {
      await registerPhoneRequestFn({
        phone: `${dialCode}${phone}`,
      });
      toast.success("Код подтверждения отправлен на указанный номер");
      setTimer(60);
      setClientStep(2);
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: unknown } })?.response
        ?.data;
      toast.error(
        extractErrorMessage(errData, "Не удалось отправить код подтверждения"),
      );
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleResendCode = async () => {
    if (timer > 0 || isRequestingCode) return;
    setIsRequestingCode(true);
    try {
      await registerPhoneRequestFn({
        phone: `${dialCode}${phone}`,
      });
      toast.success("Код подтверждения отправлен повторно");
      setTimer(60);
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: unknown } })?.response
        ?.data;
      toast.error(
        extractErrorMessage(errData, "Не удалось отправить код подтверждения"),
      );
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleSubmitClient = async () => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Пароли не совпадают");
      return;
    }
    setIsLoadingClient(true);
    try {
      let res;
      if (clientAuthMethod === "email") {
        res = await registerClientFn({
          first_name: formData.name,
          last_name: formData.surname,
          email: formData.email,
          password: formData.password,
          phone: "",
        });
      } else {
        res = await registerPhoneConfirmFn({
          first_name: formData.name,
          last_name: formData.surname,
          phone: `${dialCode}${phone}`,
          code: verificationCode,
          password: formData.password,
        });
      }
      setRememberMe(true);
      setTokens({ access: res.access, refresh: res.refresh });
      setUser(res.user);
      toast.success(`Добро пожаловать, ${res.user.first_name}!`);
      router.push(getRoleRedirect(res.user.role));
    } catch (err: unknown) {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      toast.error(
        extractErrorMessage(data, "Ошибка регистрации. Попробуйте снова"),
      );
    } finally {
      setIsLoadingClient(false);
    }
  };

  const handleSubmitDoctor = async (data: DoctorFormData) => {
    setIsLoadingDoctor(true);
    try {
      const emptyDay = { from: null, to: null, enabled: false };
      const primarySpecializations = resolveSpecializationIds(
        data.specialization ? [data.specialization] : [],
        specializationList,
      );
      const narrowSpecializations = resolveSpecializationIds(
        data.additionalSpecialization ? [data.additionalSpecialization] : [],
        specializationList,
      );

      const res = await registerDoctorFn({
        invite_clinic_id: inviteClinic?.clinicId,
        invite_branch_id: inviteClinic?.branchId ?? undefined,
        password: data.password,
        step1: {
          full_name: data.fullName,
          gender: data.gender as "male" | "female",
          birth_date: toApiDate(data.birthDate),
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
          license_date: undefined,
          license_authority: "",
          documents:
            data.certificates.length > 0 ? data.certificates : undefined,
        },
        step5: {
          primary_specialization_ids: primarySpecializations.ids,
          narrow_specialization_ids: narrowSpecializations.ids,
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
      setRememberMe(true);
      setTokens({ access: res.access, refresh: res.refresh });
      setUser(res.user);

      // Регистрационный endpoint сохраняет только часть профиля врача. Поля,
      // которые уже поддерживает профильный API, переносим сразу после
      // создания аккаунта, не заставляя врача повторно заполнять кабинет.
      try {
        const education = [
          ...(data.university
            ? [
                {
                  institution: data.university,
                  degree: data.diplomaSpecialization,
                  year: parseInt(data.graduationYear) || 0,
                },
              ]
            : []),
          ...(data.additionalEducation
            ? [
                {
                  institution: data.additionalEducation,
                  degree: "",
                  year: 0,
                },
              ]
            : []),
        ];

        await updateDoctorProfile({
          first_name: res.user.first_name,
          last_name: res.user.last_name,
          photo: data.photo ?? undefined,
          primary_specialization_ids: primarySpecializations.ids,
          narrow_specialization_ids: narrowSpecializations.ids,
          experience_years: parseInt(data.experience) || 0,
          work_experience: [
            {
              position: data.position,
              clinic: data.workplace,
              qualification: data.category,
              scientific_degree: data.academicDegree,
            },
          ],
          education,
          license_number: data.licenseNumber,
        });
      } catch {
        toast.error(
          "Аккаунт создан, но часть данных не сохранилась. Заполните их в кабинете врача.",
        );
      }

      toast.success(`Добро пожаловать, ${res.user.first_name}!`);
      router.push(ROLE_REDIRECT[res.user.role] ?? "/doctor-profile");
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: unknown } })?.response
        ?.data;
      toast.error(
        extractErrorMessage(errData, "Ошибка регистрации. Попробуйте снова"),
      );
    } finally {
      setIsLoadingDoctor(false);
    }
  };

  const handleSubmitClinic = async (data: ClinicFormData) => {
    setIsLoadingClinic(true);
    try {
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
        step5: (() => {
          const primary = resolveSpecializationIds(
            data.mainDirections
              .split(/[,.]/)
              .map((s) => s.trim())
              .filter(Boolean),
            specializationList,
          );
          const narrow = resolveSpecializationIds(
            data.narrowDirections
              .split(/[,.]/)
              .map((s) => s.trim())
              .filter(Boolean),
            specializationList,
          );
          const unmatched = [...primary.unmatched, ...narrow.unmatched];
          if (unmatched.length > 0) {
            toast.error(
              `Не найдено в справочнике и не сохранено: ${unmatched.join(", ")}`,
            );
          }
          return {
            primary_specialization_ids: primary.ids,
            narrow_specialization_ids: narrow.ids,
            additional_services: data.additionalServices || undefined,
          };
        })(),
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
      setRememberMe(true);
      setTokens({ access: res.access, refresh: res.refresh });
      setUser(res.user);
      toast.success(`Добро пожаловать, ${data.clinicName}!`);
      router.push(ROLE_REDIRECT[res.user.role] ?? "/clinic-profile");
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: unknown } })?.response
        ?.data;
      toast.error(
        extractErrorMessage(errData, "Ошибка регистрации. Попробуйте снова"),
      );
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
    <AuthShell
      header={<Header onBack={handleBack}>{AuthTabs}</Header>}
      footer={<Footer />}
    >
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
          <div className="mt-8 mb-6 md:mt-12 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Выберите свою роль
            </h2>
            <p className="text-muted text-sm md:text-base">
              Это поможет настроить для вас нужный функционал
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {ROLES.map(({ value, label, description, Icon }) => (
              <label
                key={value}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer",
                  selectedRole === value
                    ? "border-primary bg-[#FFF8F6]"
                    : "border-border bg-white hover:border-primary/40",
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
                  <p className="font-semibold text-foreground">{label}</p>
                  <p className="text-sm text-muted">{description}</p>
                </div>
                <div
                  className={cn(
                    "shrink-0 size-5 rounded-full border-4 transition-all flex items-center justify-center",
                    selectedRole === value
                      ? "border-primary"
                      : "border-border-soft",
                  )}
                >
                  {selectedRole === value && (
                    <div className="size-2.5 rounded-full bg-primary" />
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
            <div className="mb-4 px-4 py-3 rounded-xl bg-primary-tint border border-[#FDDDD5] text-sm text-secondary">
              Вы приглашены клиникой{" "}
              <span className="font-semibold text-foreground">
                {inviteClinic.clinicName}
              </span>
              {inviteClinic.branchId && inviteClinic.branchAddress && (
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
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Добро пожаловать в Imbir
            </h2>
            <p className="text-muted text-sm md:text-base">
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
              <div className="mt-1">
                <SegmentedControl
                  options={[
                    { label: "Эл. почта", value: "email" },
                    { label: "Телефон", value: "phone" },
                  ]}
                  value={clientAuthMethod}
                  onChange={(val) =>
                    setClientAuthMethod(val as "email" | "phone")
                  }
                />
              </div>
              {clientAuthMethod === "email" ? (
                <Input
                  label="Электронная почта"
                  type="email"
                  placeholder="Введите вашу почту"
                  IconRight={EmailIcon}
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              ) : (
                <PhoneInput
                  label="Номер телефона"
                  value={phone}
                  onChange={(val) => setPhone(val)}
                  onCountryChange={(country) => setDialCode(country.dialCode)}
                  defaultCountryCode="KG"
                />
              )}
            </div>
          )}

          {clientStep === 2 && (
            <div className="flex flex-col gap-4">
              {clientAuthMethod === "phone" && (
                <div className="flex flex-col gap-1.5">
                  <Input
                    label="Код подтверждения"
                    placeholder="Введите 4-значный код"
                    value={verificationCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 4) setVerificationCode(val);
                    }}
                    maxLength={4}
                    inputMode="numeric"
                  />
                  <div className="flex justify-end text-sm">
                    {timer > 0 ? (
                      <span className="text-muted">
                        Отправить код повторно через {timer} с
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isRequestingCode}
                        className="text-primary hover:text-primary-dark font-medium transition-colors"
                      >
                        Отправить код повторно
                      </button>
                    )}
                  </div>
                </div>
              )}
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
                onClick={handleClientContinue}
                disabled={
                  clientAuthMethod === "email"
                    ? !formData.name || !formData.surname || !formData.email
                    : !formData.name ||
                      !formData.surname ||
                      !phone ||
                      isRequestingCode
                }
                loading={isRequestingCode}
              >
                Продолжить
              </Button>
            ) : (
              <Button
                className="w-full justify-center md:h-14 md:text-lg"
                size="lg"
                onClick={handleSubmitClient}
                disabled={
                  clientAuthMethod === "email"
                    ? !formData.password ||
                      !formData.confirmPassword ||
                      isLoadingClient
                    : !formData.password ||
                      !formData.confirmPassword ||
                      !verificationCode ||
                      verificationCode.length < 4 ||
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
    </AuthShell>
  );
};
