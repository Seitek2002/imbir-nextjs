"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Header } from "@/widgets";

import { EmailIcon, EyeIcon, EyeOffIcon } from "@/shared/assets";
import { ROUTES } from "@/shared/config/routes";
import { Button, Checkbox, Input } from "@/shared/ui";
import { SegmentedControl } from "@/shared/ui/segmented-control/ui";

export const LoginPage = () => {
  const router = useRouter();

  const [authMode, setAuthMode] = useState<string>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!email || !password) return;

    if (password === "Imbir") {
      setError("Неверный пароль");
      return;
    }

    setError("");
    console.log("Вход:", { email, password, rememberMe });
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
        if (val === "register") router.push(ROUTES.REGISTER);
      }}
    />
  );

  return (
    <main className="min-h-screen bg-[#F2F3F5] flex flex-col">
      <Header backTo={ROUTES.HOME}>{AuthTabs}</Header>

      {/* --- ГЛАВНЫЙ КОНТЕЙНЕР ДЛЯ ДЕСКТОПНОГО ГРИДА --- */}
      <div className="flex-1 w-full max-w-360 md:max-w-340 mx-auto px-4 md:px-10 flex flex-col md:flex-row md:gap-10 pt-4 md:pt-16 pb-10">
        {/* --- ЛЕВАЯ КАРТОЧКА С КАРТИНКОЙ (md: block) --- */}
        <div className="hidden md:flex md:w-1/2 rounded-2xl p-6 bg-white shrink-0-0 items-center justify-center">
          {/* СИНИЙ ПРЯМОУГОЛЬНИК (Место под фотку) */}
          <div className="relative w-full aspect-square rounded-xl flex items-center justify-center">
            <Image src="/assets/auth-bg.png" fill alt="logo" />
          </div>
        </div>

        {/* --- ПРАВАЯ КАРТОЧКА С ФОРМОЙ (md: wider) --- */}
        <div className="flex-1 md:bg-white md:rounded-2xl md:p-10 md:pb-16 flex flex-col max-w-120 md:max-w-none mx-auto w-full">
          <div className="md:contents bg-white rounded-2xl m-2 p-4 md:p-0 flex-1 flex flex-col">
            <div className="hidden md:block">{AuthTabs}</div>

            <div className="mt-8 mb-6 md:mt-12">
              <h2 className="text-2xl font-semibold text-[#191A1B] mb-2">
                С возвращением!
              </h2>
              <p className="text-[#838A8D] text-sm md:text-base">
                Заполните данные, чтобы войти в свой аккаунт
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <Input
                label="Электронная почта"
                type="email"
                placeholder="Введите вашу почту"
                IconRight={EmailIcon}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div>
                <Input
                  label="Пароль"
                  type={showPassword ? "text" : "password"}
                  placeholder="Введите пароль"
                  IconRight={showPassword ? EyeIcon : EyeOffIcon}
                  onIconRightClick={() => setShowPassword(!showPassword)}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  error={error}
                />

                <div className="flex items-center justify-between mt-4">
                  <Checkbox
                    label="Запомнить меня"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <Link
                    href={ROUTES.FORGOT_PASSWORD}
                    className="text-sm font-medium text-[#F5653E] hover:underline"
                  >
                    Забыли пароль?
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-10 md:mt-10">
              <Button
                className="w-full justify-center md:h-14 md:text-lg"
                size="lg"
                onClick={handleSubmit}
                disabled={!email || !password}
              >
                Продолжить
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
