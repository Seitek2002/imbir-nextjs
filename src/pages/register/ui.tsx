"use client";

import { type FormEvent, JSX, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useRouter, useSearchParams } from "next/navigation";

import { toApiEducation } from "@/entities/doctor-education";
import {
  resolveSpecializationIds,
  useSpecializations,
} from "@/entities/specialization";

import {
  checkEmailAvailabilityFn,
  registerClientFn,
  registerClinicFn,
  registerDoctorFn,
  registerPhoneConfirmFn,
  registerPhoneRequestFn,
  updateClinicProfile,
  updateDoctorProfile,
  uploadClinicDocument,
  uploadClinicPhoto,
  uploadDoctorDocument,
  validateDoctorInvite,
} from "@/shared/api";
import {
  EmailIcon,
  EyeIcon,
  EyeOffIcon,
  ProfileIcon,
} from "@/shared/assets/icons";
import { colors } from "@/shared/config";
import { isEmailValid } from "@/shared/lib/booking";
import { extractErrorMessage } from "@/shared/lib/errors";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/shared/store";
import {
  Button,
  ImageWithFallback,
  Input,
  PhoneInput,
  getPhoneLength,
} from "@/shared/ui";
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

// Регистрационный endpoint иногда возвращает ФИО с собственной разбивкой на
// first_name/last_name. Для профильного PUT используем то, что ввёл врач:
// этот endpoint требует оба поля и иначе отклоняет весь запрос с данными.
const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
};

export const RegisterPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const { setTokens, setUser, setRememberMe } = useAuthStore();
  const hasInviteParams =
    searchParams.has("invite_clinic_id") || searchParams.has("clinicId");

  const [activeForm, setActiveForm] = useState<ActiveForm>(
    hasInviteParams ? "doctor" : "role",
  );
  const [selectedRole, setSelectedRole] = useState<Role | null>(
    hasInviteParams ? "doctor" : null,
  );
  const [inviteClinic, setInviteClinic] = useState<InviteClinic | undefined>();
  const [inviteValidationStatus, setInviteValidationStatus] = useState<
    "idle" | "loading" | "valid" | "invalid"
  >(hasInviteParams ? "loading" : "idle");

  // Dropdown/текстовые поля специализации хранят название (см.
  // useSpecializationOptions), а бэк на запись принимает только id — резолвим
  // перед отправкой, как и в профилях врача/клиники.
  const { data: specializationList = [] } = useSpecializations();

  useEffect(() => {
    const clinicIdParam =
      searchParams.get("invite_clinic_id") ?? searchParams.get("clinicId");
    if (!clinicIdParam) return;
    const branchIdParam =
      searchParams.get("invite_branch_id") ?? searchParams.get("branchId");
    const clinicId = Number(clinicIdParam);
    const branchId = branchIdParam ? Number(branchIdParam) : null;

    // Проверяем приглашение до показа анкеты. Публичный каталог клиник здесь
    // не подходит: invite_clinic_id — это user_id аккаунта клиники.
    setSelectedRole("doctor");
    setActiveForm("doctor");
    setInviteClinic(undefined);

    if (
      !Number.isInteger(clinicId) ||
      clinicId <= 0 ||
      (branchId !== null && (!Number.isInteger(branchId) || branchId <= 0))
    ) {
      setInviteValidationStatus("invalid");
      return;
    }

    setInviteValidationStatus("loading");

    validateDoctorInvite({
      invite_clinic_id: clinicId,
      ...(branchId ? { invite_branch_id: branchId } : {}),
    })
      .then(({ data }) => {
        if (!data.valid || !data.clinic) {
          setInviteValidationStatus("invalid");
          return;
        }
        setInviteClinic({
          clinicId,
          clinicName: data.clinic.name,
          clinicLogo: data.clinic.logo,
          clinicCity: data.clinic.city,
          branchId: data.branch?.id ?? branchId,
          branchName: data.branch?.name,
          branchAddress: data.branch?.address ?? "",
        });
        setInviteValidationStatus("valid");
      })
      .catch(() => {
        setInviteClinic(undefined);
        setInviteValidationStatus("invalid");
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
  // Ошибка почты в клиентской форме. Показываем только после попытки
  // отправки, чтобы не ругаться на каждую букву во время набора.
  const [clientEmailError, setClientEmailError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  // Проверка занятости email (POST /api/auth/email/check/) — чистая, без
  // побочных эффектов. Дёргаем её на шаге 1, а не молча создаём аккаунт на
  // шаге 2 после пароля: иначе о занятом email пациент узнаёт только в самом
  // конце, введя имя/фамилию/пароль заново впустую.
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Doctor form step (owned here for unified back navigation)
  const [doctorStep, setDoctorStep] = useState<DoctorStep>(1);
  const doctorStepRef = useRef<DoctorStep>(1);

  // Clinic form step
  const [clinicStep, setClinicStep] = useState<ClinicStep>(1);
  const clinicStepRef = useRef<ClinicStep>(1);
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
      const currentStep = doctorStepRef.current;
      if (currentStep === 1) {
        setActiveForm("role");
        doctorStepRef.current = 1;
        setDoctorStep(1);
      } else {
        const previousStep = (currentStep - 1) as DoctorStep;
        doctorStepRef.current = previousStep;
        setDoctorStep(previousStep);
      }
    } else if (activeForm === "clinic") {
      const currentStep = clinicStepRef.current;
      if (currentStep === 1) {
        setActiveForm("role");
        clinicStepRef.current = 1;
        setClinicStep(1);
      } else {
        const previousStep = (currentStep - 1) as ClinicStep;
        clinicStepRef.current = previousStep;
        setClinicStep(previousStep);
      }
    } else {
      setActiveForm("role");
    }
  };

  const handleContinueRole = () => {
    if (!selectedRole) return;
    setActiveForm(selectedRole);
  };

  // Условия готовности шагов клиентской формы. Вынесены в переменные, потому
  // что их проверяют двое: атрибут disabled у кнопки и обработчик сабмита
  // (Enter обходит disabled — браузер сабмитит форму независимо от состояния
  // кнопки). Общая переменная не даёт этим двум проверкам разойтись.
  const canContinueClient =
    clientAuthMethod === "email"
      ? !!(formData.name && formData.surname && formData.email) &&
        !isCheckingEmail
      : !!(
          formData.name &&
          formData.surname &&
          phone.length === getPhoneLength(dialCode)
        ) && !isRequestingCode;

  const canSubmitClient =
    !!formData.password &&
    !!formData.confirmPassword &&
    (clientAuthMethod === "email" || verificationCode.length === 4);

  const handleClientFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (clientStep === 1) {
      if (!canContinueClient) return;
      void handleClientContinue();
      return;
    }
    if (!canSubmitClient || isLoadingClient) return;
    void handleSubmitClient();
  };

  const handleClientContinue = async () => {
    if (clientAuthMethod === "email") {
      if (!isEmailValid(formData.email)) {
        setClientEmailError("Введите корректный email");
        return;
      }
      setClientEmailError(null);
      setIsCheckingEmail(true);
      try {
        const { data } = await checkEmailAvailabilityFn({
          email: formData.email,
        });
        if (!data.available) {
          setClientEmailError("Этот email уже используется");
          return;
        }
        setClientStep(2);
      } catch (err: unknown) {
        const errData = (err as { response?: { data?: unknown } })?.response
          ?.data;
        toast.error(extractErrorMessage(errData, "Не удалось проверить email"));
      } finally {
        setIsCheckingEmail(false);
      }
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
    // Полный номер с кодом страны: PhoneInput отдаёт только цифры, код лежит
    // в отдельном поле анкеты (см. DoctorFormData.phoneDialCode).
    const doctorPhone = data.phone ? `${data.phoneDialCode}${data.phone}` : "";
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
          phone: doctorPhone,
          email: data.email,
          photo: data.photo ?? undefined,
        },
        step2: {
          country: "kg",
          city: data.city,
          address: "",
          phone: doctorPhone,
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
        const enteredName = splitFullName(data.fullName);
        const firstName = enteredName.firstName || res.user.first_name;
        const lastName = enteredName.lastName || res.user.last_name;

        // Интернатура и ординатура заполнялись на шаге 3, но в анкету не
        // попадали вообще — теперь едут тем же массивом education
        // (см. entities/doctor-education).
        const education = toApiEducation({
          university: data.university,
          diplomaSpecialty: data.diplomaSpecialization,
          graduationYear: data.graduationYear,
          internship: data.internship,
          residency: data.residency,
          additionalEducation: data.additionalEducation
            ? [data.additionalEducation]
            : [],
        });

        // Специализации бэк принимает только id из справочника. Если
        // название не нашлось, оно молча выпадало — теперь говорим об этом,
        // как это уже делает регистрация клиники.
        const unmatched = [
          ...primarySpecializations.unmatched,
          ...narrowSpecializations.unmatched,
        ];
        if (unmatched.length > 0) {
          toast.error(
            `Не найдено в справочнике и не сохранено: ${unmatched.join(", ")}`,
          );
        }

        // Текстовые поля отправляем БЕЗ фото и отдельным запросом. Раньше всё
        // шло одним PUT вместе с файлом: любой обрыв загрузки (аватар с
        // телефона легко весит десятки мегабайт) уносил с собой
        // специализации, стаж, образование и опыт работы.
        const profileFields = {
          // first_name и last_name обязательны для каждого PUT профиля.
          first_name: firstName,
          last_name: lastName,
          phone: doctorPhone,
          gender: data.gender || undefined,
          birth_date: data.birthDate ? toApiDate(data.birthDate) : undefined,
          city: data.city,
          languages: data.languages,
          country: "kg",
          address: "",
          legal_name: data.fullName,
          primary_specialization_ids: primarySpecializations.ids,
          narrow_specialization_ids: narrowSpecializations.ids,
          additional_services: data.position || undefined,
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
        };

        await updateDoctorProfile(profileFields);

        // Файлы — после текста и каждый своим запросом, чтобы упавшая
        // загрузка не тянула за собой остальные. Сертификаты идут в
        // /api/doctor/documents/: профильный endpoint их не принимает, и
        // раньше они не отправлялись вообще.
        const fileResults = await Promise.allSettled([
          // Тот же набор полей плюс фото: PUT профиля очищает
          // primary_specialization_ids, если поле не передано, поэтому запрос
          // «только фото» стирал специализации, выставленные выше.
          ...(data.photo
            ? [updateDoctorProfile({ ...profileFields, photo: data.photo })]
            : []),
          ...data.certificates.map(uploadDoctorDocument),
        ]);
        if (fileResults.some((r) => r.status === "rejected")) {
          toast.error(
            "Аккаунт создан, но фото или сертификаты не загрузились. Добавьте их в кабинете врача.",
          );
        }
      } catch {
        toast.error(
          "Аккаунт создан, но часть данных не сохранилась. Заполните их в кабинете врача.",
        );
      }

      toast.success(`Добро пожаловать, ${res.user.first_name}!`);
      router.push(getRoleRedirect(res.user.role));
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
    // Полный номер с кодом страны — см. ClinicFormData.phoneDialCode.
    const clinicPhone = data.phone ? `${data.phoneDialCode}${data.phone}` : "";
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
          phone: clinicPhone,
          email: data.email,
          website: data.website || undefined,
          // Формат гео внутри step2 в схеме не раскрыт (drf-spectacular отдаёт
          // весь шаг как opaque string), поэтому полагаться на него нельзя —
          // координаты дублируются ниже в updateClinicProfile, где поля
          // latitude/longitude документированы. См. docs/QUESTIONS.md.
          location:
            data.latitude && data.longitude
              ? { lat: Number(data.latitude), lng: Number(data.longitude) }
              : undefined,
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

      // Файлы внутри JSON-шагов регистрации бэкенд не получает. Сохраняем
      // профиль и вложения отдельными поддерживаемыми endpoint'ами сразу
      // после создания аккаунта.
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
      const profileResult = await Promise.allSettled([
        updateClinicProfile({
          name: data.clinicName,
          clinic_type: data.clinicType,
          description: data.description,
          country: data.country,
          city: data.city,
          address: data.fullAddress,
          latitude: data.latitude || undefined,
          longitude: data.longitude || undefined,
          phone: clinicPhone,
          website: data.website || undefined,
          legal_name: data.legalName,
          reg_number: data.registrationNumber,
          license_number: data.licenseNumber,
          license_date: toApiDate(data.licenseDate),
          license_authority: data.licensingAuthority,
          primary_specialization_ids: primary.ids,
          narrow_specialization_ids: narrow.ids,
          additional_services: data.additionalServices || undefined,
          equipment: data.equipment,
          patient_conditions: data.patientConditions,
          payment_methods: data.paymentMethods,
          schedule: {
            monday: toDay(data.schedule.mon),
            tuesday: toDay(data.schedule.tue),
            wednesday: toDay(data.schedule.wed),
            thursday: toDay(data.schedule.thu),
            friday: toDay(data.schedule.fri),
            saturday: toDay(data.schedule.sat),
            sunday: toDay(data.schedule.sun),
          },
          lunch_break: data.lunchBreak,
          emergency_24_7: data.emergency247,
        }),
        ...(data.logo
          ? [
              updateClinicProfile({
                name: data.clinicName,
                logo: data.logo,
              }),
            ]
          : []),
        ...data.photos.map(uploadClinicPhoto),
        ...data.documents.map(uploadClinicDocument),
      ]);
      if (profileResult.some((result) => result.status === "rejected")) {
        toast.error(
          "Клиника создана, но часть файлов или данных не сохранилась. Попробуйте загрузить их в кабинете.",
        );
      }

      toast.success(`Добро пожаловать, ${data.clinicName}!`);
      router.push(getRoleRedirect(res.user.role));
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

  return (
    <>
      {/* Step: role selection */}
      {activeForm === "role" && (
        <form
          className="flex flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handleContinueRole();
          }}
        >
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
              type="submit"
              className="w-full justify-center md:h-14 md:text-lg"
              size="lg"
              disabled={!selectedRole}
            >
              Продолжить
            </Button>
          </div>
        </form>
      )}

      {/* Doctor registration */}
      {activeForm === "doctor" && (
        <div className="mt-8 md:mt-12 flex-1 flex flex-col">
          {inviteValidationStatus === "loading" && (
            <div className="mb-4 px-4 py-4 rounded-xl bg-background border border-border text-sm text-secondary">
              Проверяем приглашение клиники…
            </div>
          )}

          {inviteClinic && (
            <div className="mb-4 p-4 rounded-xl bg-primary-tint border border-[#FDDDD5] flex items-center gap-3">
              <div className="relative size-12 rounded-xl overflow-hidden bg-white shrink-0">
                <ImageWithFallback
                  src={inviteClinic.clinicLogo}
                  alt={inviteClinic.clinicName}
                  fill
                  sizes="48px"
                  className="object-cover"
                  fallback={
                    <div className="size-full flex items-center justify-center text-primary font-semibold text-lg">
                      {inviteClinic.clinicName.charAt(0)}
                    </div>
                  }
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-primary font-medium mb-0.5">
                  Вас приглашает клиника
                </p>
                <p className="font-semibold text-foreground truncate">
                  {inviteClinic.clinicName}
                </p>
                {(inviteClinic.branchAddress || inviteClinic.clinicCity) && (
                  <p className="text-sm text-secondary truncate">
                    {inviteClinic.branchName
                      ? `${inviteClinic.branchName} — `
                      : ""}
                    {inviteClinic.branchAddress || inviteClinic.clinicCity}
                  </p>
                )}
              </div>
            </div>
          )}

          {inviteValidationStatus === "invalid" && (
            <div className="mb-4 px-4 py-4 rounded-xl bg-[#FFF8E6] border border-[#F5D889] text-sm text-secondary">
              Приглашение недействительно или срок его действия истёк. Вы всё
              равно можете зарегистрироваться как врач, но без привязки к
              клинике.
            </div>
          )}

          {inviteValidationStatus !== "loading" && (
            <DoctorRegistrationForm
              step={doctorStep}
              onContinue={(fromStep) => {
                if (doctorStepRef.current !== fromStep) return;
                const nextStep = Math.min(
                  doctorStepRef.current + 1,
                  4,
                ) as DoctorStep;
                doctorStepRef.current = nextStep;
                setDoctorStep(nextStep);
              }}
              onSubmit={(data) => {
                if (doctorStepRef.current === 4) void handleSubmitDoctor(data);
              }}
              onBack={handleBack}
              isLoading={isLoadingDoctor}
              inviteClinic={inviteClinic}
            />
          )}
        </div>
      )}

      {/* Clinic registration */}
      {activeForm === "clinic" && (
        <div className="mt-8 md:mt-12 flex-1 flex flex-col">
          <ClinicRegistrationForm
            step={clinicStep}
            onContinue={(fromStep) => {
              if (clinicStepRef.current !== fromStep) return;
              const nextStep = Math.min(
                clinicStepRef.current + 1,
                7,
              ) as ClinicStep;
              clinicStepRef.current = nextStep;
              setClinicStep(nextStep);
            }}
            onSubmit={(data) => {
              if (clinicStepRef.current === 7) void handleSubmitClinic(data);
            }}
            onBack={handleBack}
            isLoading={isLoadingClinic}
          />
        </div>
      )}

      {/* Client registration */}
      {activeForm === "client" && (
        <form
          className="flex flex-1 flex-col"
          onSubmit={handleClientFormSubmit}
          // Нативная проверка type="email" всплывает подсказкой браузера на
          // языке ОС — на русском сайте пользователь видел английский текст.
          // Проверяем сами и показываем сообщение под полем.
          noValidate
        >
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
                name="given-name"
                autoComplete="given-name"
                placeholder="Введите ваше имя"
                IconRight={ProfileIcon}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              <Input
                label="Фамилия"
                name="family-name"
                autoComplete="family-name"
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
                  name="email"
                  autoComplete="email"
                  placeholder="Введите вашу почту"
                  IconRight={EmailIcon}
                  value={formData.email}
                  error={clientEmailError ?? undefined}
                  onChange={(e) => {
                    setClientEmailError(null);
                    handleChange("email", e.target.value);
                  }}
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
                    name="one-time-code"
                    autoComplete="one-time-code"
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
                name="new-password"
                autoComplete="new-password"
                placeholder="Введите пароль"
                IconRight={showPassword ? EyeIcon : EyeOffIcon}
                onIconRightClick={() => setShowPassword(!showPassword)}
                iconRightLabel={
                  showPassword ? "Скрыть пароль" : "Показать пароль"
                }
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
              <Input
                label="Подтвердите пароль"
                type={showConfirm ? "text" : "password"}
                name="confirm-password"
                autoComplete="new-password"
                placeholder="Введите пароль повторно"
                IconRight={showConfirm ? EyeIcon : EyeOffIcon}
                onIconRightClick={() => setShowConfirm(!showConfirm)}
                iconRightLabel={
                  showConfirm ? "Скрыть пароль" : "Показать пароль"
                }
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                error={passwordError}
              />
            </div>
          )}

          {/* «Назад» стоит выше по разметке, но это type="button" — не
              submit-кнопка, поэтому Enter её не выберет: браузер ищет первую
              именно SUBMIT-кнопку формы, а она тут одна. */}
          <div className="mt-auto pt-10 md:mt-10 flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-center md:h-14 md:text-lg"
              size="lg"
              onClick={handleBack}
            >
              Назад
            </Button>

            {clientStep === 1 ? (
              <Button
                type="submit"
                className="w-full justify-center md:h-14 md:text-lg"
                size="lg"
                disabled={!canContinueClient}
                loading={isRequestingCode || isCheckingEmail}
              >
                Продолжить
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full justify-center md:h-14 md:text-lg"
                size="lg"
                disabled={!canSubmitClient || isLoadingClient}
                loading={isLoadingClient}
              >
                Создать аккаунт
              </Button>
            )}
          </div>
        </form>
      )}
    </>
  );
};
