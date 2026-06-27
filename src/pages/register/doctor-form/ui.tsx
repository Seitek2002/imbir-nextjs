"use client";

import { useState } from "react";

import { STEP_TITLES, TOTAL_STEPS } from "./model/constants";
import type { DoctorFormData, DoctorStep, InviteClinic } from "./model/types";
import { FormSubmitButton } from "./ui/FormSubmitButton";
import { ProgressBar } from "./ui/ProgressBar";
import { Step1BasicInfo } from "./ui/Step1BasicInfo";
import { Step2Professional } from "./ui/Step2Professional";
import { Step3Education } from "./ui/Step3Education";
import { Step4Certificates } from "./ui/Step4Certificates";

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

  const handleContinue = () => {
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
    <div className="flex-1 flex flex-col">
      <ProgressBar current={step} total={TOTAL_STEPS} />
      <h2 className="text-2xl font-semibold text-foreground mb-6">
        {STEP_TITLES[step]}
      </h2>
      {steps[step]}
      <FormSubmitButton
        label={step === 4 ? "Завершить регистрацию" : "Продолжить"}
        onClick={handleContinue}
        disabled={!isValid || isLoading}
        loading={isLoading}
      />
    </div>
  );
};
