"use client";

import { FC } from "react";
import toast from "react-hot-toast";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ClinicPageLayout } from "@/widgets/clinic/layout";

import {
  resolveSpecializationIds,
  useSpecializations,
} from "@/entities/specialization";

import { clinicCabinetKeys, createClinicDoctor } from "@/shared/api";
import { extractErrorMessage } from "@/shared/lib/errors";
import { Button } from "@/shared/ui";

import {
  BasicInfoSection,
  CertificatesSection,
  EducationSection,
  ProfessionalSection,
  SectionCard,
  splitFullName,
  toDoctorProfileBody,
  useSpecialistForm,
} from "../specialist-form";

const isEmailValid = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Тот же макет, что у просмотра/редактирования уже прикреплённого специалиста
// (specialist-form) — по просьбе не верстать это заново отдельной формой.
// Бэк принимает всю карточку одним POST /api/clinic/doctors/, поэтому врача
// можно завести сразу заполненным (кроме сертификатов — они грузятся
// отдельной ручкой, которой нужен уже существующий id).
export const ClinicNewSpecialistPage: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { d, set } = useSpecialistForm();

  const { firstName, lastName, droppedPatronymic } = splitFullName(d.fullName);

  // Dropdown хранит название специализации, а бэк принимает только id.
  const { data: specializationList = [] } = useSpecializations();
  const resolveSpecs = () => {
    const primary = resolveSpecializationIds(
      d.specialization ? [d.specialization] : [],
      specializationList,
    );
    const narrow = resolveSpecializationIds(
      d.additionalSpecialization ? [d.additionalSpecialization] : [],
      specializationList,
    );
    return { primary: primary.ids, narrow: narrow.ids };
  };

  const emailTouched = d.email.length > 0;
  const emailError =
    emailTouched && !isEmailValid(d.email)
      ? "Неверный формат почты"
      : undefined;

  const canSubmit =
    firstName.length > 0 && lastName.length > 0 && isEmailValid(d.email);

  const { mutate: create, isPending } = useMutation({
    mutationFn: () =>
      createClinicDoctor({
        first_name: firstName,
        last_name: lastName,
        email: d.email.trim(),
        // PhoneInput отдаёт национальную часть — приводим к формату бэка.
        phone: d.phone ? `+996${d.phone}` : undefined,
        password: d.password.trim() || undefined,
        ...toDoctorProfileBody(d, resolveSpecs()),
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

  const handleSubmit = () => {
    if (droppedPatronymic) {
      toast(
        `Отчество «${droppedPatronymic}» не сохранится — у бэка нет для него поля`,
        { icon: "ℹ️" },
      );
    }
    create();
  };

  return (
    <ClinicPageLayout title="Добавить специалиста" desktopTitle="Мой профиль">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[28px] md:text-[32px] font-semibold text-foreground">
          Добавить специалиста
        </h2>
        <Button onClick={handleSubmit} disabled={!canSubmit || isPending}>
          {isPending ? "Добавляем..." : "Добавить"}
        </Button>
      </div>

      <div className="bg-primary-tint text-sm text-foreground rounded-2xl px-4 py-3 mb-6">
        Создаётся аккаунт врача, привязанный к вашей клинике. Карточку можно
        заполнить сразу — сохранится всё, кроме сертификатов: их получится
        загрузить после создания. График приёма и цену консультации врач
        выставляет сам в своём кабинете. Если хотите, чтобы он зарегистрировался
        самостоятельно — отправьте{" "}
        <Link
          href="/clinic-profile/invites"
          className="text-primary font-medium hover:underline"
        >
          пригласительную ссылку
        </Link>
        .
      </div>

      <SectionCard title="Основная информация">
        <BasicInfoSection
          d={d}
          set={set}
          isEditing
          isNew
          emailError={emailError}
        />
      </SectionCard>
      <SectionCard title="Профессиональные данные">
        <ProfessionalSection d={d} set={set} isEditing isNew />
      </SectionCard>
      <SectionCard title="Образование">
        <EducationSection d={d} set={set} isEditing isNew />
      </SectionCard>
      <SectionCard title="Сертификаты и документы">
        <CertificatesSection d={d} set={set} isEditing isNew />
      </SectionCard>
    </ClinicPageLayout>
  );
};
