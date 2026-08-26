"use client";

import { FC, useRef, useState } from "react";
import toast from "react-hot-toast";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ClinicPageLayout } from "@/widgets/clinic/layout";

import {
  type DayKey,
  type DayState,
  useClinicCabinet,
} from "@/entities/clinic-profile";
import { useServiceCategories } from "@/entities/service";

import {
  addClinicService,
  clinicCabinetKeys,
  getClinicDoctors,
} from "@/shared/api";
import { EditIcon } from "@/shared/assets/icons";
import { Button, Dropdown, IconBtn, Input, Textarea } from "@/shared/ui";

import {
  CURRENCY_OPTIONS,
  EMPTY_SCHEDULE,
  ScheduleEditor,
  SpecialistsPicker,
  lunchToApi,
  scheduleToApi,
} from "../procedure-form";

export const ClinicNewProcedurePage: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const { data: doctorsData } = useQuery({
    queryKey: clinicCabinetKeys.doctors(),
    queryFn: getClinicDoctors,
  });
  const doctors = doctorsData?.data ?? [];

  // Филиалы уже приходят в профиле клиники — отдельного запроса не нужно.
  const { rawProfile } = useClinicCabinet();
  const branchOptions = (rawProfile?.branches ?? []).map((b) => ({
    label: b.address || `Филиал #${b.id}`,
    value: String(b.id),
  }));

  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [category, setCategory] = useState("");
  // Категории — из справочника бэка (/api/references/service-categories/)
  const { options: categoryOptions } = useServiceCategories();
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("KGS");
  const [duration, setDuration] = useState("");
  const [branchId, setBranchId] = useState("");
  const [specialistIds, setSpecialistIds] = useState<string[]>([]);
  const [schedule, setSchedule] =
    useState<Record<DayKey, DayState>>(EMPTY_SCHEDULE);
  const [lunchFrom, setLunchFrom] = useState("");
  const [lunchTo, setLunchTo] = useState("");

  const setDay = (key: DayKey, patch: Partial<DayState>) =>
    setSchedule((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Превью рисуем из data-URL, а на бэк уходит сам File (multipart).
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addMutation = useMutation({
    mutationFn: addClinicService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicCabinetKeys.services() });
      toast.success("Процедура добавлена");
      router.push("/clinic-profile/procedures");
    },
    onError: (err: unknown) => {
      const errData = (
        err as { response?: { data?: Record<string, string[]> } }
      )?.response?.data;
      toast.error(
        errData
          ? Object.values(errData).flat()[0]
          : "Не удалось сохранить процедуру. Попробуйте снова",
      );
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    // Бэк требует category (пустая → 400 «Это поле не может быть пустым»).
    // Ловим до запроса и явно называем поле — иначе пользователь видит
    // непонятную ошибку без привязки к полю.
    if (!category) {
      toast.error("Выберите специализацию");
      return;
    }
    addMutation.mutate({
      name: name.trim(),
      category,
      description: description.trim() || undefined,
      price: price.trim() || undefined,
      duration: duration ? Number(duration) : undefined,
      is_active: true,
      // Врачи клиники, которым назначается услуга. Бэк принимает только id
      // врачей, привязанных к этой клинике (иначе 400), и сам проставляет
      // услугу им в список.
      doctor_ids: specialistIds.map(Number),
      ...(photoFile ? { photo: photoFile } : {}),
      branch_id: branchId ? Number(branchId) : null,
      schedule: scheduleToApi(schedule),
      lunch_break: lunchToApi(lunchFrom, lunchTo),
    });
  };

  return (
    <ClinicPageLayout
      title="Добавить процедуру"
      desktopTitle="Мой профиль"
      mobileAction={
        <IconBtn
          onClick={handleSave}
          disabled={addMutation.isPending}
          variant="text"
          size="sm"
          className="text-primary"
          aria-label="Сохранить"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 10L8 14L16 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </IconBtn>
      }
    >
      <div className="hidden md:flex items-center gap-4 mb-6">
        <IconBtn
          onClick={() => router.back()}
          variant="text"
          size="sm"
          className="shrink-0"
          aria-label="Назад"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </IconBtn>
        <h2 className="text-[28px] font-semibold text-foreground flex-1">
          Добавить процедуру
        </h2>
        <Button onClick={handleSave} disabled={addMutation.isPending}>
          {addMutation.isPending ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhoto}
      />

      <div className="bg-white rounded-3xl border border-border p-5 mb-4 flex flex-col gap-4">
        <div>
          <label className="block text-foreground text-sm font-medium mb-1.5">
            Фото процедуры
          </label>
          <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-surface">
            {photoPreview ? (
              <Image
                src={photoPreview}
                alt="Фото"
                fill
                sizes="112px"
                unoptimized={photoPreview.startsWith("data:")}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="20" fill="#F2F4F7" />
                </svg>
              </div>
            )}
            <IconBtn
              onClick={() => photoInputRef.current?.click()}
              variant="outline"
              size="xs"
              className="absolute top-1.5 right-1.5 bg-white"
              aria-label="Добавить фото"
            >
              <EditIcon className="w-4 h-4" />
            </IconBtn>
          </div>
        </div>

        <Input
          label="Название"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value.trim()) setNameError(false);
          }}
          placeholder="Введите название"
          error={nameError ? "Обязательное поле" : undefined}
        />

        <Dropdown
          label="Специализация"
          placeholder="Выберите из списка"
          options={categoryOptions}
          value={category}
          onChange={setCategory}
        />

        <div className="grid items-end grid-cols-2 gap-4">
          <Input
            label="Стоимость"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
          />
          <Dropdown
            label=" "
            options={CURRENCY_OPTIONS}
            value={currency}
            onChange={setCurrency}
            className=""
          />
        </div>

        <Input
          label="Длительность, мин"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="0"
        />
        <Textarea
          label="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Расскажите, как проходит процедура"
          rows={3}
        />

        {/* Бэк привязывает процедуру к филиалу (branch_id), а не к свободному
            тексту: название и адрес у филиала уже есть. */}
        <Dropdown
          label="Филиал, где проводится процедура"
          placeholder={
            branchOptions.length ? "Выберите филиал" : "У клиники нет филиалов"
          }
          options={branchOptions}
          value={branchId}
          onChange={setBranchId}
        />
      </div>

      <div className="bg-white rounded-3xl border border-border p-5 mb-4">
        <h3 className="text-foreground font-semibold text-lg mb-3">
          Специалисты, выполняющие услугу
        </h3>
        <SpecialistsPicker
          doctors={doctors}
          selectedIds={specialistIds}
          onAdd={(id) => setSpecialistIds((prev) => [...prev, id])}
          onRemove={(id) =>
            setSpecialistIds((prev) => prev.filter((x) => x !== id))
          }
          isEditing
        />
      </div>

      <div className="bg-white rounded-3xl border border-border p-5 mb-4">
        <h3 className="text-foreground font-semibold text-lg mb-1">
          График проведения процедуры
        </h3>
        <ScheduleEditor
          schedule={schedule}
          setDay={setDay}
          lunchFrom={lunchFrom}
          lunchTo={lunchTo}
          setLunchFrom={setLunchFrom}
          setLunchTo={setLunchTo}
          isEditing
        />
      </div>

      {/* Блока «Записи» здесь нет: процедуры ещё не существует, записаться на
          неё нельзя — календарь показывался бы заведомо пустым. Он остаётся
          на странице уже созданной процедуры (detail). */}
    </ClinicPageLayout>
  );
};
