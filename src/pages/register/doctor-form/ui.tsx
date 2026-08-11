"use client";

import { useState } from "react";

import { STEP_TITLES, TOTAL_STEPS } from "../model/constants";
import type { DoctorFormData, DoctorStep, InviteClinic } from "../model/types";
import { FormSubmitButton } from "./FormSubmitButton";
import { ProgressBar } from "./ProgressBar";
import { Step1BasicInfo } from "./Step1BasicInfo";
import { Step2Professional } from "./Step2Professional";
import { Step3Education } from "./Step3Education";
import { Step4Certificates } from "./Step4Certificates";

type Props = {
  step: DoctorStep;
  onContinue: () => void;
  onSubmit: (data: DoctorFormData) => void;
  isLoading?: boolean;
  inviteClinic?: InviteClinic;
};

export const DoctorRegistrationForm = ({
  step,
  onContinue,
  onSubmit,
  isLoading = false,
  inviteClinic,
}: Props) => {
  const [data, setData] = useState<DoctorFormData>({
    fullName: "",
    gender: "",
    birthDate: "",
    city: "",
    languages: [],
    phone: "",
    email: "",
    photo: null,
    specialization: "",
    additionalSpecialization: "",
    experience: "0",
    position: "",
    workplace: inviteClinic?.clinicName ?? "",
    category: "",
    academicDegree: "",
    university: "",
    graduationYear: "",
    internship: "",
    residency: "",
    diplomaSpecialization: "",
    additionalEducation: "",
    certificates: [],
    licenseNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");

  const handleChange = <K extends keyof DoctorFormData>(
    key: K,
    value: DoctorFormData[K],
  ) => {
    if (key === "password" || key === "confirmPassword") setPasswordError("");
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const isStep1Valid = !!(
    data.fullName &&
    data.gender &&
    data.birthDate &&
    data.city &&
    data.phone.length > 0 &&
    data.email
  );

  const isValid =
    step === 1
      ? isStep1Valid
      : step === 4
        ? !!data.password && data.password === data.confirmPassword
        : true;

  // Один обработчик и на клик по кнопке, и на Enter из любого поля шага.
  // Промежуточные шаги ведут к следующему, последний — сабмитит всю форму.
  const handleContinue = () => {
    if (!isValid || isLoading) return;
    if (step < 4) {
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

  const steps: Record<DoctorStep, React.ReactNode> = {
    1: <Step1BasicInfo data={data} onChange={handleChange} />,
    2: (
      <Step2Professional
        data={data}
        onChange={handleChange}
        inviteClinic={inviteClinic}
      />
    ),
    3: <Step3Education data={data} onChange={handleChange} />,
    4: (
      <Step4Certificates
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
        label={step === 4 ? "Завершить регистрацию" : "Продолжить"}
        disabled={!isValid || isLoading}
        loading={isLoading}
      />
    </form>
  );
};
