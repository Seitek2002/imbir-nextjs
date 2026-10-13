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
import {
  AuthImagePanel,
  Button,
  type Country,
  IconBtn,
  Input,
  PhoneInput,
  getPhoneLength,
} from "@/shared/ui";
import { SegmentedControl } from "@/shared/ui/segmented-control";

type Step = "code" | "email" | "new_password" | "success";

// Пациент, зарегистрированный по телефону, почты не имеет — код ему приходит
// в СМС на номер.
type ResetBy = "email" | "phone";

// Бэк требует код ровно из 6 цифр (minLength/maxLength: 6 в
// PasswordResetVerifyRequest/PasswordResetConfirmRequest).
const CODE_LENGTH = 6;

export const ForgotPasswordPage = () => {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");

  // Стейты данных
  const [resetBy, setResetBy] = useState<ResetBy>("email");
  const [email, setEmail] = useState("");
  // Как на входе: национальная часть номера и код страны из PhoneInput,
  // полный номер собираем только при отправке.
  const [phoneLocal, setPhoneLocal] = useState("");
  const [dialCode, setDialCode] = useState("+996");
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
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
      setCode(Array(CODE_LENGTH).fill(""));
    },
    onError: (err) => {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      toast.error(
        extractErrorMessage(data, "Не удалось отправить код. Попробуйте снова"),
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

  // Контакт, на который ушёл код: тот же канал передаём на проверку кода и
  // при сохранении пароля.
  const target =
    resetBy === "email" ? { email } : { phone: `${dialCode}${phoneLocal}` };
  const targetFilled =
    resetBy === "email"
      ? !!email
      : phoneLocal.length === getPhoneLength(dialCode);

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

  const focusCell = (index: number) =>
    document.getElementById(`code-input-${index}`)?.focus();

  // Раскладывает цифры по ячейкам, начиная с index. Нужна и для вставки из
  // буфера, и для автоподстановки кода на телефоне: раньше у ячеек стоял
  // maxLength=1, браузер обрезал вставку до одной цифры, и заполнялась только
  // первая ячейка.
  const fillCode = (index: number, digits: string) => {
    const chars = digits.slice(0, CODE_LENGTH - index).split("");
    if (chars.length === 0) return;
    const newCode = [...code];
    chars.forEach((digit, i) => {
      newCode[index + i] = digit;
    });
    setCode(newCode);
    focusCell(Math.min(index + chars.length, CODE_LENGTH - 1));
  };

  // Хендлер для посимвольного ввода кода
  const handleCodeChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, "");
    if (value && !digits) return; // Только цифры
    // Больше двух цифр разом — это подстановка всего кода (автозаполнение
    // из SMS/письма кладёт его в одну ячейку). Две — цифру допечатали в уже
    // заполненную ячейку: берём новую.
    if (digits.length > 2) {
      fillCode(index, digits);
      return;
    }
    const newCode = [...code];
    newCode[index] = digits.slice(-1);
    setCode(newCode);

    // Автофокус на следующий инпут
    if (digits && index < CODE_LENGTH - 1) focusCell(index + 1);
  };

  const handleCodePaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
    fillCode(index, e.clipboardData.getData("text").replace(/\D/g, ""));
  };

  // Backspace в пустой ячейке стирает предыдущую и переводит фокус на неё.
  const handleCodeKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key !== "Backspace" || code[index] || index === 0) return;
    e.preventDefault();
    const newCode = [...code];
    newCode[index - 1] = "";
    setCode(newCode);
    focusCell(index - 1);
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
        {/* --- ЛЕВАЯ КАРТОЧКА: та же картинка, что на входе и регистрации --- */}
        <AuthImagePanel />

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
              <form
                className="flex flex-1 flex-col"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!targetFilled || requestResetMutation.isPending) return;
                  requestResetMutation.mutate(target);
                }}
              >
                <div className="mt-4 mb-6 md:mt-0">
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    Восстановить пароль
                  </h2>
                  <p className="text-muted text-sm md:text-base">
                    {resetBy === "email"
                      ? "Введите почту, к которой привязан ваш аккаунт"
                      : "Введите номер телефона, к которому привязан ваш аккаунт"}
                  </p>
                </div>
                <div className="flex flex-col gap-4">
                  <SegmentedControl
                    options={[
                      { label: "Эл. почта", value: "email" },
                      { label: "Телефон", value: "phone" },
                    ]}
                    value={resetBy}
                    onChange={setResetBy}
                  />
                  {resetBy === "email" ? (
                    <Input
                      label="Электронная почта"
                      type="email"
                      name="email"
                      autoComplete="email"
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
                </div>
                <div className="mt-auto pt-10 md:mt-10">
                  <Button
                    type="submit"
                    className="w-full justify-center md:h-14 md:text-lg"
                    size="lg"
                    disabled={!targetFilled || requestResetMutation.isPending}
                  >
                    {requestResetMutation.isPending
                      ? "Отправка..."
                      : "Получить код"}
                  </Button>
                </div>
              </form>
            )}

            {/* === ШАГ 2: ВВОД КОДА === */}
            {step === "code" && (
              <form
                className="flex flex-1 flex-col"
                onSubmit={(e) => {
                  e.preventDefault();
                  const value = code.join("");
                  if (value.length < CODE_LENGTH || verifyMutation.isPending)
                    return;
                  verifyMutation.mutate({ ...target, code: value });
                }}
              >
                <div className="mt-4 mb-6 md:mt-0 text-center md:text-left">
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    Восстановить пароль
                  </h2>
                  <p className="text-muted text-sm md:text-base">
                    {resetBy === "email"
                      ? "Введите код подтверждения, отправленный на вашу почту"
                      : "Введите код подтверждения из СМС"}
                  </p>
                </div>

                <div className="flex justify-center md:justify-start gap-2 md:gap-3 my-6">
                  {code.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`code-input-${idx}`}
                      type="text"
                      inputMode="numeric"
                      // Подсказка ОС подставить код из SMS/письма — только в
                      // первую ячейку, дальше его раскладывает handleCodeChange.
                      autoComplete={idx === 0 ? "one-time-code" : "off"}
                      aria-label={`Цифра ${idx + 1} из ${CODE_LENGTH}`}
                      value={digit}
                      onChange={(e) => handleCodeChange(idx, e.target.value)}
                      onPaste={(e) => handleCodePaste(idx, e)}
                      // Выделяем цифру: новая заменит её, а не встанет рядом.
                      onFocus={(e) => e.target.select()}
                      onKeyDown={(e) => handleCodeKeyDown(idx, e)}
                      className="size-11 md:size-14 text-center text-2xl font-medium border border-border-soft rounded-xl focus:border-primary focus:outline-none focus:shadow-[0_0_0_2px_rgba(245,101,62,0.2)] transition-all"
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
                      // Без type кнопка внутри <form> считается submit —
                      // «Получить код повторно» отправляла бы форму проверки.
                      type="button"
                      className="text-sm text-primary hover:underline disabled:opacity-50"
                      disabled={requestResetMutation.isPending}
                      onClick={() => requestResetMutation.mutate(target)}
                    >
                      Получить код повторно
                    </button>
                  )}
                </div>

                <div className="mt-auto pt-10 md:mt-10">
                  <Button
                    type="submit"
                    className="w-full justify-center md:h-14 md:text-lg"
                    size="lg"
                    disabled={
                      code.join("").length < CODE_LENGTH ||
                      verifyMutation.isPending
                    }
                  >
                    {verifyMutation.isPending ? "Проверка..." : "Подтвердить"}
                  </Button>
                </div>
              </form>
            )}

            {/* === ШАГ 3: НОВЫЙ ПАРОЛЬ (Твой 2-й скрин) === */}
            {step === "new_password" && (
              <form
                className="flex flex-1 flex-col"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!isPasswordValid || confirmMutation.isPending) return;
                  confirmMutation.mutate({
                    ...target,
                    code: code.join(""),
                    password,
                  });
                }}
              >
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
                    name="new-password"
                    autoComplete="new-password"
                    placeholder="Введите новый пароль"
                    IconRight={showPassword ? EyeIcon : EyeOffIcon}
                    onIconRightClick={() => setShowPassword(!showPassword)}
                    iconRightLabel={
                      showPassword ? "Скрыть пароль" : "Показать пароль"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Input
                    label="Подтвердите новый пароль"
                    type={showConfirm ? "text" : "password"}
                    name="confirm-password"
                    autoComplete="new-password"
                    placeholder="Введите новый пароль повторно"
                    IconRight={showConfirm ? EyeIcon : EyeOffIcon}
                    onIconRightClick={() => setShowConfirm(!showConfirm)}
                    iconRightLabel={
                      showConfirm ? "Скрыть пароль" : "Показать пароль"
                    }
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
                    type="submit"
                    className="w-full justify-center md:h-14 md:text-lg"
                    size="lg"
                    disabled={!isPasswordValid || confirmMutation.isPending}
                  >
                    {confirmMutation.isPending
                      ? "Сохранение..."
                      : "Сохранить пароль"}
                  </Button>
                </div>
              </form>
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
