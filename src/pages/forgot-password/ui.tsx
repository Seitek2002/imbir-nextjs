"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import { Header } from "@/widgets/header";

import {
  confirmPasswordResetFn,
  requestPasswordResetFn,
  verifyPasswordResetFn,
} from "@/shared/api";
import {
  CheckIcon,
  EmailIcon,
  EyeIcon,
  EyeOffIcon,
} from "@/shared/assets/icons";
import { colors } from "@/shared/config";
import { ROUTES } from "@/shared/config";
import { extractErrorMessage } from "@/shared/lib/errors";
import { cn } from "@/shared/lib/utils";
import { Button, IconBtn, Input } from "@/shared/ui";

type Step = "email" | "code" | "new_password" | "success";

export const ForgotPasswordPage = () => {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");

  // Стейты данных
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Таймер повторной отправки кода (59с, как в макете).
  const [resendLeft, setResendLeft] = useState(59);

  useEffect(() => {
    if (step !== "code" || resendLeft <= 0) return;
    const timer = setInterval(() => setResendLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [step, resendLeft]);

  const requestResetMutation = useMutation({
    mutationFn: requestPasswordResetFn,
    onSuccess: () => {
      setStep("code");
      setResendLeft(59);
      setCode(["", "", "", ""]);
    },
    onError: (err) => {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      toast.error(
        extractErrorMessage(
          data,
          "Не удалось отправить письмо. Попробуйте снова",
        ),
      );
    },
  });

  const verifyMutation = useMutation({
    mutationFn: verifyPasswordResetFn,
    onSuccess: () => setStep("new_password"),
    onError: (err) => {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      toast.error(extractErrorMessage(data, "Неверный или истёкший код"));
    },
  });

  const confirmMutation = useMutation({
    mutationFn: confirmPasswordResetFn,
    onSuccess: () => setStep("success"),
    onError: (err) => {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      toast.error(
        extractErrorMessage(
          data,
          "Не удалось сохранить пароль. Попробуйте снова",
        ),
      );
    },
  });

  // Валидация пароля
  const isLengthValid = password.length >= 8;
  const hasUpperAndLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isPasswordValid =
    isLengthValid &&
    hasUpperAndLower &&
    hasNumber &&
    password === confirmPassword &&
    password !== "";

  // Хендлер для 4-значного кода
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Только цифры
    const newCode = [...code];
    newCode[index] = value.slice(-1); // Берем только последний символ
    setCode(newCode);

    // Автофокус на следующий инпут
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleBack = () => {
    if (step === "code") setStep("email");
    else if (step === "new_password") setStep("code");
    else if (step === "success") router.push(ROUTES.LOGIN);
    else router.back();
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header backTo={step === "success" ? undefined : ROUTES.LOGIN} />

      <div className="flex-1 w-full max-w-360 md:max-w-340 mx-auto px-4 md:px-10 flex flex-col md:flex-row md:gap-10 pt-4 md:pt-16 pb-10">
        {/* --- ЛЕВАЯ КАРТОЧКА --- */}
        <div className="hidden md:flex md:w-1/2 rounded-2xl p-6 bg-white shrink-0 items-center justify-center">
          <div className="relative w-full aspect-square rounded-xl bg-[#ADD8E6] flex items-center justify-center border-2 border-dashed border-muted/50 text-muted">
            <span className="text-xl font-medium">Место для картинки</span>
          </div>
        </div>

        {/* --- ПРАВАЯ КАРТОЧКА --- */}
        <div className="flex-1 md:bg-white md:rounded-2xl md:p-10 md:pb-16 flex flex-col max-w-120 md:max-w-none mx-auto w-full relative">
          <div className="md:contents bg-white rounded-2xl m-2 p-4 md:p-0 flex-1 flex flex-col">
            {/* Кнопка назад внутри карточки (как на скринах) */}
            {step !== "success" && (
              <IconBtn
                onClick={handleBack}
                variant="outline"
                className="hidden md:flex size-10 mb-6"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.5 15L7.5 10L12.5 5"
                    stroke={colors.foreground}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconBtn>
            )}

            {/* === ШАГ 1: ВВОД EMAIL (Логически необходим) === */}
            {step === "email" && (
              <>
                <div className="mt-4 mb-6 md:mt-0">
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    Восстановить пароль
                  </h2>
                  <p className="text-muted text-sm md:text-base">
                    Введите почту, к которой привязан ваш аккаунт
                  </p>
                </div>
                <Input
                  label="Электронная почта"
                  type="email"
                  placeholder="Введите вашу почту"
                  IconRight={EmailIcon}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="mt-auto pt-10 md:mt-10">
                  <Button
                    className="w-full justify-center md:h-14 md:text-lg"
                    size="lg"
                    onClick={() => requestResetMutation.mutate({ email })}
                    disabled={!email || requestResetMutation.isPending}
                  >
                    {requestResetMutation.isPending
                      ? "Отправка..."
                      : "Получить код"}
                  </Button>
                </div>
              </>
            )}

            {/* === ШАГ 2: ВВОД КОДА === */}
            {step === "code" && (
              <>
                <div className="mt-4 mb-6 md:mt-0 text-center md:text-left">
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    Восстановить пароль
                  </h2>
                  <p className="text-muted text-sm md:text-base">
                    Введите код подтверждения, отправленный на вашу почту
                  </p>
                </div>

                <div className="flex justify-center md:justify-start gap-3 md:gap-4 my-6">
                  {code.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`code-input-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(idx, e.target.value)}
                      className="size-14 md:size-16 text-center text-2xl font-medium border border-border-soft rounded-xl focus:border-primary focus:outline-none focus:shadow-[0_0_0_2px_rgba(245,101,62,0.2)] transition-all"
                    />
                  ))}
                </div>

                <div className="text-center md:text-left">
                  {resendLeft > 0 ? (
                    <span className="text-sm text-muted">
                      Получить код повторно через 00:
                      {String(resendLeft).padStart(2, "0")}
                    </span>
                  ) : (
                    <button
                      className="text-sm text-primary hover:underline disabled:opacity-50"
                      disabled={requestResetMutation.isPending}
                      onClick={() => requestResetMutation.mutate({ email })}
                    >
                      Получить код повторно
                    </button>
                  )}
                </div>

                <div className="mt-auto pt-10 md:mt-10">
                  <Button
                    className="w-full justify-center md:h-14 md:text-lg"
                    size="lg"
                    onClick={() =>
                      verifyMutation.mutate({ email, code: code.join("") })
                    }
                    disabled={
                      code.join("").length < 4 || verifyMutation.isPending
                    }
                  >
                    {verifyMutation.isPending ? "Проверка..." : "Подтвердить"}
                  </Button>
                </div>
              </>
            )}

            {/* === ШАГ 3: НОВЫЙ ПАРОЛЬ (Твой 2-й скрин) === */}
            {step === "new_password" && (
              <>
                <div className="mt-4 mb-6 md:mt-0">
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    Восстановить пароль
                  </h2>
                  <p className="text-muted text-sm md:text-base">
                    Придумайте и подтвердите новый пароль для вашего аккаунта
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <Input
                    label="Новый пароль"
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите новый пароль"
                    IconRight={showPassword ? EyeIcon : EyeOffIcon}
                    onIconRightClick={() => setShowPassword(!showPassword)}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Input
                    label="Подтвердите новый пароль"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Введите новый пароль повторно"
                    IconRight={showConfirm ? EyeIcon : EyeOffIcon}
                    onIconRightClick={() => setShowConfirm(!showConfirm)}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {/* Чеклист валидации */}
                <div className="mt-6 flex flex-col gap-2">
                  <span className="text-sm text-muted mb-1">
                    Пароль должен содержать:
                  </span>
                  <ValidationItem
                    isValid={isLengthValid}
                    text="8 или более символов латинского алфавита"
                  />
                  <ValidationItem
                    isValid={hasUpperAndLower}
                    text="Заглавные и строчные буквы"
                  />
                  <ValidationItem isValid={hasNumber} text="Цифры" />
                </div>

                <div className="mt-auto pt-10 md:mt-10">
                  <Button
                    className="w-full justify-center md:h-14 md:text-lg"
                    size="lg"
                    onClick={() =>
                      confirmMutation.mutate({
                        email,
                        code: code.join(""),
                        password,
                      })
                    }
                    disabled={!isPasswordValid || confirmMutation.isPending}
                  >
                    {confirmMutation.isPending
                      ? "Сохранение..."
                      : "Сохранить пароль"}
                  </Button>
                </div>
              </>
            )}

            {/* === ШАГ 4: УСПЕХ === */}
            {step === "success" && (
              <div className="flex flex-col items-center justify-center h-full my-auto py-10 md:py-20 text-center">
                <div className="size-24 md:size-32 bg-primary-tint rounded-full mb-6 flex items-center justify-center">
                  <CheckIcon className="size-12 md:size-16 [&_path]:stroke-primary" />
                </div>

                <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
                  Пароль успешно сохранён!
                </h2>
                <p className="text-muted text-sm md:text-base mb-10">
                  Войдите в свой аккаунт с новым паролем
                </p>

                <Button
                  className="w-full max-w-70 justify-center md:h-14 md:text-lg"
                  size="lg"
                  onClick={() => router.push(ROUTES.LOGIN)}
                >
                  Войти
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

// Компонент для галочек валидации
const ValidationItem = ({
  isValid,
  text,
}: {
  isValid: boolean;
  text: string;
}) => (
  <div className="flex items-center gap-2">
    <div
      className={cn(
        "flex items-center justify-center size-5 rounded-full",
        isValid ? "bg-[#4CAF50]" : "bg-border-soft",
      )}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 3L4.5 8.5L2 6"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <span
      className={cn(
        "text-sm transition-colors",
        isValid ? "text-foreground" : "text-muted",
      )}
    >
      {text}
    </span>
  </div>
);
