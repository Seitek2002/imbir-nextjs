"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Header } from "@/widgets/header";

import { loginFn } from "@/shared/api/auth/requests";
import { EmailIcon, EyeIcon, EyeOffIcon } from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config/routes";
import { useAuthStore } from "@/shared/store";
import { Button, Checkbox, Input } from "@/shared/ui";
import { SegmentedControl } from "@/shared/ui/segmented-control/ui";

const ROLE_REDIRECT: Record<string, string> = {
  patient: "/profile",
  doctor: "/doctor-profile",
  clinic: "/clinic-profile",
};

export const LoginPage = () => {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();

  const [authMode, setAuthMode] = useState<string>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setError("");
    setIsLoading(true);

    try {
      const res = await loginFn({ email, password });
      setTokens({ access: res.access, refresh: res.refresh });
      setUser(res.user);
      toast.success(`Добро пожаловать, ${res.user.first_name}!`);
      router.push(ROLE_REDIRECT[res.user.role] ?? ROUTES.PROFILE);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string; error?: string } } })
          ?.response?.data?.detail ??
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ??
        "Неверный email или пароль";
      setError(msg);
    } finally {
      setIsLoading(false);
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
        if (val === "register") router.push(ROUTES.REGISTER);
      }}
    />
  );

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header backTo={ROUTES.HOME}>{AuthTabs}</Header>

      <div className="flex-1 w-full max-w-360 md:max-w-340 mx-auto px-4 md:px-10 flex flex-col md:flex-row md:gap-10 pt-4 md:pt-16 pb-10">
        {/* Left decorative panel */}
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
            <div className="hidden md:block">{AuthTabs}</div>

            <div className="mt-8 mb-6 md:mt-12">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                С возвращением!
              </h2>
              <p className="text-muted text-sm md:text-base">
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
                    className="text-sm font-medium text-primary hover:underline"
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
                disabled={!email || !password || isLoading}
                loading={isLoading}
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
