"use client";

import { FC, useRef, useState } from "react";
import toast from "react-hot-toast";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ClinicPageLayout } from "@/widgets/clinic/layout";

import { type DayKey, type DayState } from "@/entities/clinic-profile";

import {
  clinicCabinetKeys,
  deleteClinicService,
  getClinicDoctors,
  getClinicServices,
  updateClinicService,
} from "@/shared/api";
import { EditIcon, TrashIcon } from "@/shared/assets/icons";
import { Button, ConfirmDialog, Dropdown } from "@/shared/ui";

import {
  CATEGORY_OPTIONS,
  CURRENCY_OPTIONS,
  EMPTY_SCHEDULE,
  FieldRow,
  RecordsPreview,
  ScheduleEditor,
  SpecialistsPicker,
  inp,
  lbl,
} from "../procedure-form";

export const ClinicProcedureDetailPage: FC = () => {
  const params = useParams<{ id: string }>() ?? { id: "" };
  const serviceId = Number(params.id);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: clinicCabinetKeys.services(),
    queryFn: getClinicServices,
  });
  const service = (data?.data ?? []).find((s) => s.id === serviceId) ?? null;

  const { data: doctorsData } = useQuery({
    queryKey: clinicCabinetKeys.doctors(),
    queryFn: getClinicDoctors,
  });
  const doctors = doctorsData?.data ?? [];

  // Локальная форма — сюда же входят поля, которых нет на бэке (фото, адрес
  // клиники, специалисты, график, слоты записи).
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("KGS");
  const [duration, setDuration] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [specialistIds, setSpecialistIds] = useState<string[]>([]);
  const [schedule, setSchedule] =
    useState<Record<DayKey, DayState>>(EMPTY_SCHEDULE);
  const [lunchFrom, setLunchFrom] = useState("");
  const [lunchTo, setLunchTo] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [synced, setSynced] = useState<typeof service>(null);
  if (service && service !== synced) {
    setSynced(service);
    setName(service.name);
    setCategory(service.category ?? "");
    setPrice(service.price ?? "");
    setDuration(service.duration != null ? String(service.duration) : "");
    setClinicName(service.clinic?.name ?? "");
  }

  const setDay = (key: DayKey, patch: Partial<DayState>) =>
    setSchedule((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      updateClinicService(serviceId, {
        name: name.trim(),
        category,
        price: price.trim() || undefined,
        duration: duration ? Number(duration) : undefined,
        is_active: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicCabinetKeys.services() });
      toast.success("Процедура сохранена");
      setIsEditing(false);
    },
    onError: (err: unknown) => {
      const errData = (
        err as { response?: { data?: Record<string, string[]> } }
      )?.response?.data;
      toast.error(
        errData
          ? Object.values(errData).flat()[0]
          : "Не удалось сохранить. Попробуйте снова",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteClinicService(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicCabinetKeys.services() });
      toast.success("Процедура удалена");
      router.push("/clinic-profile/procedures");
    },
    onError: () => toast.error("Не удалось удалить процедуру"),
  });

  if (isLoading) {
    return (
      <ClinicPageLayout title="Процедура" desktopTitle="Мой профиль">
        <div className="flex items-center justify-center py-20 text-muted">
          Загрузка...
        </div>
      </ClinicPageLayout>
    );
  }

  if (!service) {
    return (
      <ClinicPageLayout title="Процедура" desktopTitle="Мой профиль">
        <div className="bg-white rounded-3xl border border-border px-6 py-16 text-center text-muted">
          Процедура не найдена
        </div>
      </ClinicPageLayout>
    );
  }

  const photo = (
    <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-primary-tint shrink-0">
      {photoPreview ? (
        <Image
          src={photoPreview}
          alt={name}
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
      {isEditing && (
        <button
          onClick={() => photoInputRef.current?.click()}
          className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center hover:bg-surface transition-colors"
          aria-label="Изменить фото"
        >
          <EditIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <>
      <ClinicPageLayout
        title={isEditing ? "Редактировать" : ""}
        desktopTitle="Мой профиль"
        mobileAction={
          isEditing ? (
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
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
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-muted hover:bg-surface transition-colors"
                aria-label="Редактировать"
              >
                <EditIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setDeleteOpen(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-primary-tint transition-colors"
                aria-label="Удалить"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          )
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
            {isEditing ? "Редактировать" : "Назад"}
          </h2>
          {isEditing ? (
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Сохранение..." : "Сохранить"}
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                IconLeft={EditIcon}
                onClick={() => setIsEditing(true)}
              >
                Редактировать
              </Button>
              <Button
                variant="outline"
                IconLeft={TrashIcon}
                onClick={() => setDeleteOpen(true)}
              >
                Удалить
              </Button>
            </div>
          )}
        </div>

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhoto}
        />

        {!isEditing && (
          <div className="bg-white rounded-3xl border border-border p-5 mb-4 flex items-center gap-4">
            {photo}
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                {service.name}
              </h3>
              <p className="text-muted text-sm mt-0.5">{service.category}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-border p-5 mb-4">
          {isEditing ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className={lbl}>Фото процедуры</label>
                {photo}
              </div>
              <div>
                <label className={lbl}>Название</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введите название"
                  className={inp}
                />
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
                <label className={lbl}>Клиника, проводящая процедуру</label>
                <input
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="Введите название клиники"
                  className={inp}
                />
              </div>
              <div>
                <label className={lbl}>
                  Адрес клиники, проводящей процедуру
                </label>
                <input
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                  placeholder="Введите адрес клиники"
                  className={inp}
                />
              </div>
            </div>
          ) : (
            <>
              <FieldRow label="Стоимость">
                {service.price ? `${service.price} с` : "—"}
              </FieldRow>
              <FieldRow label="Клиника">
                {clinicName || service.clinic?.name}
              </FieldRow>
              <FieldRow label="Адрес клиники">{clinicAddress}</FieldRow>
            </>
          )}
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
            isEditing={isEditing}
          />
        </div>

        <div className="bg-white rounded-3xl border border-border p-5 mb-4">
          <h3 className="text-foreground font-semibold text-lg mb-1">
            {isEditing ? "График проведения процедуры" : "График процедуры"}
          </h3>
          <ScheduleEditor
            schedule={schedule}
            setDay={setDay}
            lunchFrom={lunchFrom}
            lunchTo={lunchTo}
            setLunchFrom={setLunchFrom}
            setLunchTo={setLunchTo}
            isEditing={isEditing}
          />
        </div>

        <div className="bg-white rounded-3xl border border-border p-5">
          <h3 className="text-foreground font-semibold text-lg mb-3">Записи</h3>
          <RecordsPreview />
        </div>
      </ClinicPageLayout>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          deleteMutation.mutate();
        }}
        icon={<TrashIcon className="w-7 h-7 text-primary" />}
        title="Удалить процедуру?"
        description="Действие нельзя отменить — процедура исчезнет из списка услуг клиники"
        confirmLabel="Удалить"
        cancelLabel="Отмена"
      />
    </>
  );
};
