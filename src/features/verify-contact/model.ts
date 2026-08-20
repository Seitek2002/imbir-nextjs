"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  verifyEmailConfirmFn,
  verifyEmailRequestFn,
  verifyPhoneConfirmFn,
  verifyPhoneRequestFn,
} from "@/shared/api";
import { extractErrorMessage } from "@/shared/lib/errors";

export type VerifyChannel = "email" | "phone";

export const CODE_LENGTH = 4;
const RESEND_SECONDS = 60;

type Params = {
  email: string;
  // Полный номер с кодом страны — бэк ждёт именно его, а PhoneInput отдаёт
  // только цифры без кода, поэтому склеивать нужно на стороне формы.
  phone: string;
};

// Гейт регистрации врача и клиники: бэк не примет анкету, пока один из
// контактов не подтверждён кодом (POST /api/auth/verify/{email,phone}/*).
// Подтверждение НЕ создаёт аккаунт и живёт 24 часа, поэтому упавшую по другой
// причине регистрацию можно повторить, не запрашивая код заново.
export const useVerifyContact = ({ email, phone }: Params) => {
  const [channel, setChannel] = useState<VerifyChannel>("email");
  const [code, setCode] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const target = channel === "email" ? email : phone;

  // Смена канала обнуляет подтверждение: гейт снимается для конкретного
  // контакта, и код от почты не подойдёт телефону.
  const changeChannel = (next: VerifyChannel) => {
    if (next === channel) return;
    setChannel(next);
    setCode("");
    setIsSent(false);
    setIsVerified(false);
    setTimer(0);
  };

  const requestCode = async (): Promise<boolean> => {
    if (isRequesting || timer > 0) return false;
    if (!target) {
      toast.error(
        channel === "email"
          ? "Укажите почту в анкете — на неё придёт код"
          : "Укажите телефон в анкете — на него придёт код",
      );
      return false;
    }

    setIsRequesting(true);
    try {
      if (channel === "email") await verifyEmailRequestFn({ email: target });
      else await verifyPhoneRequestFn({ phone: target });

      setIsSent(true);
      setTimer(RESEND_SECONDS);
      toast.success(`Код отправлен на ${target}`);
      return true;
    } catch (err: unknown) {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      toast.error(extractErrorMessage(data, "Не удалось отправить код"));
      return false;
    } finally {
      setIsRequesting(false);
    }
  };

  const confirmCode = async (): Promise<boolean> => {
    if (isVerifying || code.length !== CODE_LENGTH) return false;

    setIsVerifying(true);
    try {
      if (channel === "email")
        await verifyEmailConfirmFn({ email: target, code });
      else await verifyPhoneConfirmFn({ phone: target, code });

      setIsVerified(true);
      toast.success("Контакт подтверждён");
      return true;
    } catch (err: unknown) {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      toast.error(extractErrorMessage(data, "Неверный или истёкший код"));
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  // Контакт поменяли после подтверждения — прежнее подтверждение к новому
  // адресу не относится, гейт снова закрыт.
  const [verifiedTarget, setVerifiedTarget] = useState("");
  if (isVerified && verifiedTarget !== target) {
    if (verifiedTarget === "") setVerifiedTarget(target);
    else {
      setVerifiedTarget("");
      setIsVerified(false);
      setIsSent(false);
      setCode("");
    }
  }

  return {
    channel,
    changeChannel,
    target,
    code,
    setCode,
    isSent,
    isVerified,
    isRequesting,
    isVerifying,
    timer,
    requestCode,
    confirmCode,
  };
};

export type VerifyContactState = ReturnType<typeof useVerifyContact>;
