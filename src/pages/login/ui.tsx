"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

import { loginFn } from "@/shared/api";
import { EmailIcon, EyeIcon, EyeOffIcon } from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config";
import { useAuthStore } from "@/shared/store";
import {
  AuthShell,
  Button,
  Checkbox,
  type Country,
  Input,
  PhoneInput,
} from "@/shared/ui";
import { SegmentedControl } from "@/shared/ui/segmented-control";

type LoginBy = "email" | "phone";

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
  return ROLE_REDIRECT[role] ?? ROUTES.PROFILE;
};

export const LoginPage = () => {
  const router = useRouter();
  const {
    setTokens,
    setUser,
    setRememberMe: setRememberMeStore,
  } = useAuthStore();

  const [authMode, setAuthMode] = useState<string>("login");
  const [loginBy, setLoginBy] = useState<LoginBy>("email");
  const [email, setEmail] = useState("");
  // Телефон храним раздельно: национальную часть (phoneLocal) и код страны из
  // PhoneInput — полный E.164-номер собираем только при отправке.
  const [phoneLocal, setPhoneLocal] = useState("");
  const [dialCode, setDialCode] = useState("+996");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const identifierFilled = loginBy === "email" ? !!email : !!phoneLocal;

  const handleSubmit = async () => {
    if (!identifierFilled || !password) return;
    setError("");
    setIsLoading(true);

    try {
      // Бэк принимает identifier ТОЛЬКО в поле `email` — и почту, и телефон
      // (в формате E.164). Отдельного поля `phone` у логина нет.
      const identifier =
        loginBy === "email" ? email : `${dialCode}${phoneLocal}`;
      const res = await loginFn({ email: identifier, password });
      setRememberMeStore(rememberMe);
      setTokens({ access: res.access, refresh: res.refresh });
      setUser(res.user);
      toast.success(`Добро пожаловать, ${res.user.first_name}!`);
      router.push(getRoleRedirect(res.user.role));
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string; error?: string } } })
          ?.response?.data?.detail ??
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ??
        (loginBy === "email"
          ? "Неверный email или пароль"
          : "Неверный номер телефона или пароль");
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
    <AuthShell
      header={<Header backTo={ROUTES.HOME}>{AuthTabs}</Header>}
      footer={<Footer />}
    >
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
        <SegmentedControl
          options={[
            { label: "Эл. почта", value: "email" },
            { label: "Телефон", value: "phone" },
          ]}
          value={loginBy}
          onChange={(val) => {
            setLoginBy(val);
            setError("");
          }}
        />

        {loginBy === "email" ? (
          <Input
            label="Электронная почта"
            type="email"
            placeholder="Введите вашу почту"
            IconRight={EmailIcon}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        ) : (
          <PhoneInput
            label="Номер телефона"
            value={phoneLocal}
            onChange={setPhoneLocal}
            onCountryChange={(c: Country) => setDialCode(c.dialCode)}
          />
        )}

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
          disabled={!identifierFilled || !password || isLoading}
          loading={isLoading}
        >
          Продолжить
        </Button>
      </div>
    </AuthShell>
  );
};
