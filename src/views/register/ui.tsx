"use client";

import { useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { Header } from "@/widgets";

import { EmailIcon, EyeIcon, EyeOffIcon, ProfileIcon } from "@/shared/assets";
import { ROUTES } from "@/shared/config/routes";
import { Button, Input } from "@/shared/ui";
import { SegmentedControl } from "@/shared/ui/segmented-control/ui";

export const RegisterPage = () => {
  const router = useRouter();

  const [authMode, setAuthMode] = useState<string>("register");
  const [step, setStep] = useState<1 | 2>(1);

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

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "confirmPassword" || field === "password") {
      setPasswordError("");
    }
  };

  const handleNextStep = () => setStep(2);

  const handleBack = () => {
    if (step === 2) setStep(1);
    else router.back();
  };

  const handleSubmit = () => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Пароли не совпадают");
      return;
    }
    console.log("Регистрация:", formData);
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
      <Header backTo={ROUTES.HOME}>{AuthTabs}</Header>

      {/* --- ГЛАВНЫЙ КОНТЕЙНЕР ДЛЯ ДЕСКТОПНОГО ГРИДА --- */}
      <div className="flex-1 w-full max-w-360 md:max-w-340 mx-auto px-4 md:px-10 flex flex-col md:flex-row md:gap-10 pt-4 md:pt-16 pb-10">
        {/* --- ЛЕВАЯ КАРТОЧКА С КАРТИНКОЙ (md: block) --- */}
        <div className="hidden md:flex md:w-1/2 rounded-2xl p-6 bg-white shrink-0 items-center justify-center">
          <div className="relative w-full aspect-square rounded-xl flex items-center justify-center">
            <Image src="/assets/auth-bg.png" fill alt="logo" />
          </div>
        </div>

        {/* --- ПРАВАЯ КАРТОЧКА С ФОРМОЙ (md: wider) --- */}
        <div className="flex-1 md:bg-white md:rounded-2xl md:p-10 md:pb-16 flex flex-col max-w-[480px] md:max-w-none mx-auto w-full">
          <div className="md:contents bg-white rounded-2xl m-2 p-4 md:p-0 flex-1 flex flex-col">
            <div className="hidden md:block">{AuthTabs}</div>

            <div className="mt-8 mb-6 md:mt-12">
              <h2 className="text-2xl font-semibold text-[#191A1B] mb-2">
                Добро пожаловать в Imbir
              </h2>
              <p className="text-[#838A8D] text-sm md:text-base">
                {step === 1
                  ? "Заполните данные, чтобы создать аккаунт"
                  : "Придумайте и подтвердите пароль вашего аккаунта"}
              </p>
            </div>

            {step === 1 && (
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

            {step === 2 && (
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
              {step === 2 && (
                <Button
                  variant="outline"
                  className="w-full justify-center md:h-[56px] md:text-lg"
                  size="lg"
                  onClick={handleBack}
                >
                  Назад к данным
                </Button>
              )}

              {step === 1 ? (
                <Button
                  className="w-full justify-center md:h-[56px] md:text-lg"
                  size="lg"
                  onClick={handleNextStep}
                  disabled={
                    !formData.name || !formData.surname || !formData.email
                  }
                >
                  Продолжить
                </Button>
              ) : (
                <Button
                  className="w-full justify-center md:h-[56px] md:text-lg"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!formData.password || !formData.confirmPassword}
                >
                  Создать аккаунт
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
