"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import {
  VerifyContactBlock,
  useVerifyContact,
} from "@/features/verify-contact";

import { checkEmailAvailabilityFn } from "@/shared/api";
import { extractErrorMessage } from "@/shared/lib/errors";
import {
  PASSWORD_REQUIREMENTS_ERROR,
  isStrongPassword,
} from "@/shared/lib/password";
import { getPhoneLength } from "@/shared/ui";

import {
  CLINIC_PAYMENT_METHODS,
  CLINIC_STEP_TITLES as STEP_TITLES,
  CLINIC_TOTAL_STEPS as TOTAL_STEPS,
} from "../model/constants";
import type { ClinicFormData, ClinicStep, ScheduleDay } from "../model/types";
import { FormSubmitButton } from "./FormSubmitButton";
import { ProgressBar } from "./ProgressBar";
import { Step1BasicInfo } from "./Step1BasicInfo";
import { Step2Location } from "./Step2Location";
import { Step3Schedule, validateSchedule } from "./Step3Schedule";
import { Step4Legal } from "./Step4Legal";
import { Step5Specialization } from "./Step5Specialization";
import { Step6Equipment } from "./Step6Equipment";
import { Step7Completion } from "./Step7Completion";

type Props = {
  step: ClinicStep;
  onContinue: (fromStep: ClinicStep) => void;
  onSubmit: (data: ClinicFormData) => void;
  onBack: () => void;
  isLoading?: boolean;
};

const emptyDay: ScheduleDay = { from: "", to: "" };

const INITIAL_DATA: ClinicFormData = {
  clinicName: "",
  logo: null,
  clinicType: "",
  description: "",
  photos: [],
  country: "Кыргызстан",
  city: "Бишкек",
  fullAddress: "",
  phoneDialCode: "+996",
  phone: "",
  email: "",
  website: "",
  latitude: "",
  longitude: "",
  schedule: {
    mon: emptyDay,
    tue: emptyDay,
    wed: emptyDay,
    thu: emptyDay,
    fri: emptyDay,
    sat: emptyDay,
    sun: emptyDay,
  },
  lunchBreak: emptyDay,
  emergency247: false,
  legalName: "",
  registrationNumber: "",
  licenseNumber: "",
  licenseDate: "",
  licensingAuthority: "",
  documents: [],
  mainDirections: [],
  narrowDirections: [],
  additionalServices: "",
  equipment: [],
  patientConditions: [],
  // Не выбирается пользователем: поля в форме нет, оплата у всех онлайн.
  paymentMethods: CLINIC_PAYMENT_METHODS,
  agreeRules: false,
  agreePrivacy: false,
  agreeDataProcessing: false,
  agreeAccuracy: false,
  password: "",
  confirmPassword: "",
};

export const ClinicRegistrationForm = ({
  step,
  onContinue,
  onSubmit,
  onBack,
  isLoading = false,
}: Props) => {
  const [data, setData] = useState<ClinicFormData>(INITIAL_DATA);
  const [passwordError, setPasswordError] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  // Блок подтверждения показывается только после первой попытки отправить
  // анкету — до этого он был бы шумом, а код успел бы истечь.
  const [showVerify, setShowVerify] = useState(false);
  // POST /api/auth/email/check/ — чистая проверка занятости на шаге 2, а не
  // только на финальном сабмите (см. тот же приём в doctor-form/ui.tsx).
  // Почта на этом шаге необязательна (isValid её не требует) — проверяем
  // только если что-то ввели, формат не валидируем (этот шаг и раньше не
  // валидировал формат — оставляем эту часть бэку на финальном сабмите).
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const verify = useVerifyContact({
    email: data.email,
    phone: data.phone ? `${data.phoneDialCode}${data.phone}` : "",
  });

  const handleChange = <K extends keyof ClinicFormData>(
    key: K,
    value: ClinicFormData[K],
  ) => {
    if (key === "password" || key === "confirmPassword") setPasswordError("");
    if (key === "lunchBreak" || key === "emergency247") setScheduleError("");
    if (key === "email") setEmailError(null);
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDayChange = (
    day: keyof ClinicFormData["schedule"],
    value: ScheduleDay,
  ) => {
    setScheduleError("");
    setData((prev) => ({
      ...prev,
      schedule: { ...prev.schedule, [day]: value },
    }));
  };

  const allAgreed =
    data.agreeRules &&
    data.agreePrivacy &&
    data.agreeDataProcessing &&
    data.agreeAccuracy;

  const isValid =
    step === 1
      ? !!data.clinicName
      : step === 2
        ? data.phone.length === getPhoneLength(data.phoneDialCode)
        : step === 7
          ? allAgreed &&
            !!data.password &&
            data.password === data.confirmPassword
          : true;

  // Один обработчик и на клик по кнопке, и на Enter из любого поля шага.
  // Промежуточные шаги ведут к следующему, последний — сабмитит всю форму.
  const handleContinue = async () => {
    if (!isValid || isLoading || isCheckingEmail) return;
    if (step < 7) {
      if (step === 2 && data.email.trim()) {
        setIsCheckingEmail(true);
        try {
          const { data: check } = await checkEmailAvailabilityFn({
            email: data.email,
          });
          if (!check.available) {
            setEmailError("Этот email уже используется");
            return;
          }
        } catch (err: unknown) {
          const errData = (err as { response?: { data?: unknown } })?.response
            ?.data;
          toast.error(
            extractErrorMessage(errData, "Не удалось проверить email"),
          );
        } finally {
          setIsCheckingEmail(false);
        }
      }
      if (step === 3) {
        const error = validateSchedule(data);
        if (error) {
          setScheduleError(error);
          return;
        }
      }
      onContinue(step);
    } else {
      if (data.password !== data.confirmPassword) {
        setPasswordError("Пароли не совпадают");
        return;
      }
      if (!isStrongPassword(data.password)) {
        setPasswordError(PASSWORD_REQUIREMENTS_ERROR);
        return;
      }
      setPasswordError("");

      // Гейт бэка: /register/clinic/ отдаёт 400, пока почта или телефон из
      // анкеты не подтверждены кодом. Подтверждение живёт 24 часа, поэтому
      // повторная отправка упавшей анкеты кода уже не потребует.
      if (!verify.isVerified) {
        setShowVerify(true);
        if (verify.isSent)
          toast.error("Сначала подтвердите почту или телефон кодом");
        return;
      }

      onSubmit(data);
    }
  };

  const steps: Record<ClinicStep, React.ReactNode> = {
    1: <Step1BasicInfo data={data} onChange={handleChange} />,
    2: (
      <Step2Location
        data={data}
        onChange={handleChange}
        emailError={emailError}
      />
    ),
    3: (
      <Step3Schedule
        data={data}
        onChange={handleChange}
        onDayChange={handleDayChange}
        validationError={scheduleError}
      />
    ),
    4: <Step4Legal data={data} onChange={handleChange} />,
    5: <Step5Specialization data={data} onChange={handleChange} />,
    6: <Step6Equipment data={data} onChange={handleChange} />,
    7: (
      <Step7Completion
        data={data}
        onChange={handleChange}
        passwordError={passwordError}
        verifySlot={
          showVerify ? (
            <VerifyContactBlock
              state={verify}
              onConfirmed={() => {
                if (!isStrongPassword(data.password)) {
                  setPasswordError(PASSWORD_REQUIREMENTS_ERROR);
                  return;
                }
                onSubmit(data);
              }}
            />
          ) : null
        }
      />
    ),
  };

  return (
    <form
      className="flex-1 flex flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        handleContinue();
      }}
    >
      <ProgressBar current={step} total={TOTAL_STEPS} />
      <h2 className="text-2xl font-semibold text-foreground mb-6">
        {STEP_TITLES[step]}
      </h2>
      {steps[step]}
      <FormSubmitButton
        label={step === 7 ? "Завершить регистрацию" : "Продолжить"}
        disabled={!isValid || isLoading || isCheckingEmail}
        loading={isLoading || isCheckingEmail}
        onBack={onBack}
      />
    </form>
  );
};
