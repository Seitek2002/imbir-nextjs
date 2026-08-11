"use client";

import { useState } from "react";

import {
  CLINIC_STEP_TITLES as STEP_TITLES,
  CLINIC_TOTAL_STEPS as TOTAL_STEPS,
} from "../model/constants";
import type { ClinicFormData, ClinicStep, ScheduleDay } from "../model/types";
import { FormSubmitButton } from "./FormSubmitButton";
import { ProgressBar } from "./ProgressBar";
import { Step1BasicInfo } from "./Step1BasicInfo";
import { Step2Location } from "./Step2Location";
import { Step3Schedule } from "./Step3Schedule";
import { Step4Legal } from "./Step4Legal";
import { Step5Specialization } from "./Step5Specialization";
import { Step6Equipment } from "./Step6Equipment";
import { Step7Completion } from "./Step7Completion";

type Props = {
  step: ClinicStep;
  onContinue: () => void;
  onSubmit: (data: ClinicFormData) => void;
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
  phone: "",
  email: "",
  website: "",
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
  mainDirections: "",
  narrowDirections: "",
  additionalServices: "",
  equipment: [],
  patientConditions: [],
  paymentMethods: [],
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
  isLoading = false,
}: Props) => {
  const [data, setData] = useState<ClinicFormData>(INITIAL_DATA);
  const [passwordError, setPasswordError] = useState("");

  const handleChange = <K extends keyof ClinicFormData>(
    key: K,
    value: ClinicFormData[K],
  ) => {
    if (key === "password" || key === "confirmPassword") setPasswordError("");
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDayChange = (
    day: keyof ClinicFormData["schedule"],
    value: ScheduleDay,
  ) =>
    setData((prev) => ({
      ...prev,
      schedule: { ...prev.schedule, [day]: value },
    }));

  const allAgreed =
    data.agreeRules &&
    data.agreePrivacy &&
    data.agreeDataProcessing &&
    data.agreeAccuracy;

  const isValid =
    step === 1
      ? !!data.clinicName
      : step === 7
        ? allAgreed && !!data.password && data.password === data.confirmPassword
        : true;

  // Один обработчик и на клик по кнопке, и на Enter из любого поля шага.
  // Промежуточные шаги ведут к следующему, последний — сабмитит всю форму.
  const handleContinue = () => {
    if (!isValid || isLoading) return;
    if (step < 7) {
      onContinue();
    } else {
      if (data.password !== data.confirmPassword) {
        setPasswordError("Пароли не совпадают");
        return;
      }
      setPasswordError("");
      onSubmit(data);
    }
  };

  const steps: Record<ClinicStep, React.ReactNode> = {
    1: <Step1BasicInfo data={data} onChange={handleChange} />,
    2: <Step2Location data={data} onChange={handleChange} />,
    3: (
      <Step3Schedule
        data={data}
        onChange={handleChange}
        onDayChange={handleDayChange}
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
        disabled={!isValid || isLoading}
        loading={isLoading}
      />
    </form>
  );
};
