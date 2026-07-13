"use client";

import { FC, useRef, useState } from "react";
import toast from "react-hot-toast";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ClinicPageLayout } from "@/widgets/clinic/layout";

import { type DayKey, type DayState } from "@/entities/clinic-profile";

import {
  addClinicService,
  clinicCabinetKeys,
  getClinicDoctors,
} from "@/shared/api";
import { EditIcon } from "@/shared/assets/icons";
import { Button, Dropdown } from "@/shared/ui";

import {
  CATEGORY_OPTIONS,
  CURRENCY_OPTIONS,
  EMPTY_SCHEDULE,
  RecordsPreview,
  ScheduleEditor,
  SpecialistsPicker,
  inp,
  lbl,
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

  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("KGS");
  const [duration, setDuration] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
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
    addMutation.mutate({
      name: name.trim(),
      category,
      price: price.trim() || undefined,
      duration: duration ? Number(duration) : undefined,
      is_active: true,
    });
  };

  return (
    <ClinicPageLayout
      title="Добавить процедуру"
      desktopTitle="Мой профиль"
      mobileAction={
        <button
          onClick={handleSave}
          disabled={addMutation.isPending}
          className="w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-surface transition-colors disabled:opacity-50"
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
        </button>
      }
    >
      <div className="hidden md:flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface transition-colors shrink-0"
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
        </button>
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
          <label className={lbl}>Фото процедуры</label>
          <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-surface">
            {photoPreview ? (
              <Image
                src={photoPreview}
                alt="Фото"
                fill
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
            <button
              onClick={() => photoInputRef.current?.click()}
              className="absolute top-1.5 right-1.5 w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center hover:bg-surface transition-colors"
              aria-label="Добавить фото"
            >
              <EditIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <label className={lbl}>Название</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value.trim()) setNameError(false);
            }}
            placeholder="Введите название"
            className={`${inp} ${nameError ? "border-primary" : ""}`}
          />
          {nameError && (
            <p className="text-primary text-xs mt-1">Обязательное поле</p>
          )}
        </div>

        <Dropdown
          label="Специализация"
          placeholder="Выберите из списка"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={setCategory}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Стоимость</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className={inp}
            />
          </div>
          <Dropdown
            label=" "
            options={CURRENCY_OPTIONS}
            value={currency}
            onChange={setCurrency}
          />
        </div>

        <div>
          <label className={lbl}>Длительность, мин</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="0"
            className={inp}
          />
        </div>

        <div>
          <label className={lbl}>Клиника, проводящая процедуру</label>
          <input
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
            placeholder="Введите название клиники"
            className={inp}
          />
        </div>

        <div>
          <label className={lbl}>Адрес клиники, проводящей процедуру</label>
          <input
            value={clinicAddress}
            onChange={(e) => setClinicAddress(e.target.value)}
            placeholder="Введите адрес клиники"
            className={inp}
          />
        </div>
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

      <div className="bg-white rounded-3xl border border-border p-5">
        <h3 className="text-foreground font-semibold text-lg mb-3">Записи</h3>
        <RecordsPreview />
      </div>
    </ClinicPageLayout>
  );
};
