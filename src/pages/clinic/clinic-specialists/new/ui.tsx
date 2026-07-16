"use client";

import { FC, useState } from "react";
import toast from "react-hot-toast";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ClinicPageLayout } from "@/widgets/clinic/layout";

import { clinicCabinetKeys, createClinicDoctor } from "@/shared/api";
import { extractErrorMessage } from "@/shared/lib/errors";
import { Button, Input, PhoneInput } from "@/shared/ui";

// Пароль по умолчанию задаёт бэк, если поле не прислать (см. спецификацию
// POST /api/clinic/doctors/). Показываем его клинике, чтобы было что передать
// врачу для первого входа.
const DEFAULT_PASSWORD = "Doctor123!";

const isEmailValid = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Создание аккаунта врача клиникой. Бэк (POST /api/clinic/doctors/) принимает
// только first_name/last_name/email/phone/password — создаёт User(role=doctor),
// DoctorProfile с городом клиники и связь DoctorClinicLink. Остальные данные
// (специализация, образование, сертификаты) врач заполняет сам после входа:
// эндпоинтов для правки чужого профиля со стороны клиники у бэка нет
// (GET/PUT /api/clinic/doctors/{id}/ → 405), поэтому форма намеренно
// ограничена тем, что реально сохраняется.
export const ClinicNewSpecialistPage: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [password, setPassword] = useState("");

  const emailTouched = email.length > 0;
  const emailError =
    emailTouched && !isEmailValid(email) ? "Неверный формат почты" : undefined;

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    isEmailValid(email);

  const { mutate: create, isPending } = useMutation({
    mutationFn: () =>
      createClinicDoctor({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        // PhoneInput отдаёт национальную часть — приводим к формату бэка.
        phone: phoneLocal ? `+996${phoneLocal}` : undefined,
        password: password.trim() || undefined,
      }),
    onSuccess: (doctor) => {
      toast.success(`Врач ${doctor.full_name} добавлен`);
      queryClient.invalidateQueries({ queryKey: clinicCabinetKeys.doctors() });
      router.push("/clinic-profile/specialists");
    },
    onError: (err: unknown) => {
      const errData = (err as { response?: { data?: unknown } })?.response
        ?.data;
      // Бэк возвращает 400 с полями (напр. почта/телефон уже заняты).
      toast.error(extractErrorMessage(errData, "Не удалось добавить врача"));
    },
  });

  return (
    <ClinicPageLayout title="Добавить специалиста" desktopTitle="Мой профиль">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[28px] md:text-[32px] font-semibold text-foreground">
          Добавить специалиста
        </h2>
        <Button onClick={() => create()} disabled={!canSubmit || isPending}>
          {isPending ? "Добавляем..." : "Добавить"}
        </Button>
      </div>

      <div className="bg-primary-tint text-sm text-foreground rounded-2xl px-4 py-3 mb-6">
        Создаётся аккаунт врача, привязанный к вашей клинике. Специализацию,
        образование и документы врач заполнит сам после первого входа. Если
        хотите, чтобы он зарегистрировался самостоятельно — отправьте{" "}
        <Link
          href="/clinic-profile/invites"
          className="text-primary font-medium hover:underline"
        >
          пригласительную ссылку
        </Link>
        .
      </div>

      <div className="bg-white rounded-3xl border border-border p-5 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Input
            label="Имя"
            placeholder="Асан"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            label="Фамилия"
            placeholder="Усенов"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <Input
            label="Почта"
            placeholder="doctor@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            hint="На неё врач будет входить в систему"
          />
          <PhoneInput
            label="Телефон"
            value={phoneLocal}
            onChange={setPhoneLocal}
          />
          <div className="lg:col-span-2">
            <Input
              label="Пароль"
              placeholder={DEFAULT_PASSWORD}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint={`Необязательно. Если оставить пустым — будет ${DEFAULT_PASSWORD}. Передайте пароль врачу для первого входа.`}
            />
          </div>
        </div>
      </div>
    </ClinicPageLayout>
  );
};
