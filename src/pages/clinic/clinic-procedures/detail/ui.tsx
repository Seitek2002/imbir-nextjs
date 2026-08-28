"use client";

import { FC, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useParams, useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ClinicPageLayout } from "@/widgets/clinic/layout";

import {
  type DayKey,
  type DayState,
  useClinicCabinet,
} from "@/entities/clinic-profile";
import { useServiceCategories } from "@/entities/service";

import {
  clinicCabinetKeys,
  deleteClinicService,
  getClinicDoctors,
  getClinicService,
  updateClinicService,
} from "@/shared/api";
import { EditIcon, TrashIcon } from "@/shared/assets/icons";
import {
  Button,
  ConfirmDialog,
  Dropdown,
  IconBtn,
  ImageWithFallback,
  Input,
  Textarea,
} from "@/shared/ui";

import {
  CURRENCY_OPTIONS,
  EMPTY_SCHEDULE,
  FieldRow,
  RecordsPreview,
  ScheduleEditor,
  SpecialistsPicker,
  lunchToApi,
  scheduleFromApi,
  scheduleToApi,
} from "../procedure-form";

export const ClinicProcedureDetailPage: FC = () => {
  const params = useParams<{ id: string }>() ?? { id: "" };
  const serviceId = Number(params.id);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Раньше карточку искали в общем списке — теперь у бэка есть своя ручка.
  const { data: service = null, isLoading } = useQuery({
    queryKey: clinicCabinetKeys.service(serviceId),
    queryFn: () => getClinicService(serviceId),
    enabled: Number.isFinite(serviceId),
  });

  const { data: doctorsData } = useQuery({
    queryKey: clinicCabinetKeys.doctors(),
    queryFn: getClinicDoctors,
  });
  const doctors = doctorsData?.data ?? [];

  // Локальная форма. Все поля ниже бэк принимает — включая фото, филиал
  // проведения и график (появились после доработки).
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  // Категории — из справочника бэка (/api/references/service-categories/)
  const { options: categoryOptions } = useServiceCategories();
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("KGS");
  const [duration, setDuration] = useState("");
  const [branchId, setBranchId] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [specialistIds, setSpecialistIds] = useState<string[]>([]);
  const [schedule, setSchedule] =
    useState<Record<DayKey, DayState>>(EMPTY_SCHEDULE);
  const [lunchFrom, setLunchFrom] = useState("");
  const [lunchTo, setLunchTo] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Филиалы уже есть в профиле клиники — отдельного запроса не нужно.
  const { rawProfile } = useClinicCabinet();
  const branchOptions = (rawProfile?.branches ?? []).map((b) => ({
    label: b.address || `Филиал #${b.id}`,
    value: String(b.id),
  }));

  const [synced, setSynced] = useState<typeof service>(null);
  if (service && service !== synced) {
    setSynced(service);
    setName(service.name);
    setCategory(service.category ?? "");
    setDescription(service.description ?? "");
    setPrice(service.price ?? "");
    setDuration(service.duration != null ? String(service.duration) : "");
    setBranchId(service.branch ? String(service.branch.id) : "");
    setPhotoPreview(service.photo ?? undefined);
    setPhotoFile(null);
    setSchedule(scheduleFromApi(service.schedule));
    setLunchFrom(service.lunch_break?.from ?? "");
    setLunchTo(service.lunch_break?.to ?? "");
    // Врачи, которым услуга уже назначена (бэк отдаёт их в doctors[]).
    setSpecialistIds((service.doctors ?? []).map((d) => String(d.id)));
  }

  const setDay = (key: DayKey, patch: Partial<DayState>) =>
    setSchedule((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Превью — data-URL, на бэк уходит сам File (multipart).
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      updateClinicService(serviceId, {
        name: name.trim(),
        category,
        description: description.trim(),
        price: price.trim() || undefined,
        duration: duration ? Number(duration) : undefined,
        is_active: true,
        // При PUT бэк заменяет старые связи врач↔услуга на переданные.
        doctor_ids: specialistIds.map(Number),
        // Фото шлём только когда его реально меняли: иначе PUT затрёт
        // уже загруженную картинку пустым значением.
        ...(photoFile ? { photo: photoFile } : {}),
        branch_id: branchId ? Number(branchId) : null,
        schedule: scheduleToApi(schedule),
        lunch_break: lunchToApi(lunchFrom, lunchTo),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicCabinetKeys.services() });
      queryClient.invalidateQueries({
        queryKey: clinicCabinetKeys.service(serviceId),
      });
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

  // Бэк требует name и category (пустые → 400 «Это поле не может быть
  // пустым» без указания поля). Проверяем до запроса и называем поле явно.
  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Введите название");
      return;
    }
    if (!category) {
      toast.error("Выберите специализацию");
      return;
    }
    saveMutation.mutate();
  };

  const deleteMutation = useMutation({
    mutationFn: () => deleteClinicService(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicCabinetKeys.services() });
      toast.success("Процедура удалена");
      router.push("/clinic-profile/procedures");
    },
    onError: () => toast.error("Не удалось удалить процедуру"),
  });

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync();
      setDeleteOpen(false);
    } catch {
      // ошибка уже обработана в onError мутации (toast)
    }
  };

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
      <ImageWithFallback
        src={photoPreview}
        alt={name}
        fill
        sizes="112px"
        unoptimized={photoPreview?.startsWith("data:")}
        className="object-cover"
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#F2F4F7" />
            </svg>
          </div>
        }
      />
      {isEditing && (
        <IconBtn
          onClick={() => photoInputRef.current?.click()}
          variant="outline"
          size="xs"
          className="absolute bottom-1.5 right-1.5 bg-white"
          aria-label="Изменить фото"
        >
          <EditIcon className="w-3.5 h-3.5" />
        </IconBtn>
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
            <IconBtn
              onClick={handleSave}
              disabled={saveMutation.isPending}
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
          ) : (
            <div className="flex items-center gap-1">
              <IconBtn
                onClick={() => setIsEditing(true)}
                variant="text"
                size="sm"
                className="text-muted"
                aria-label="Редактировать"
              >
                <EditIcon className="w-5 h-5" />
              </IconBtn>
              <IconBtn
                onClick={() => setDeleteOpen(true)}
                variant="text"
                size="sm"
                className="text-primary hover:bg-primary-tint"
                aria-label="Удалить"
              >
                <TrashIcon className="w-5 h-5" />
              </IconBtn>
            </div>
          )
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
            {isEditing ? "Редактировать" : "Назад"}
          </h2>
          {isEditing ? (
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
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
                <label className="block text-foreground text-sm font-medium mb-1.5">
                  Фото процедуры
                </label>
                {photo}
              </div>
              <Input
                label="Название"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите название"
              />
              <Dropdown
                label="Категория услуги"
                placeholder="Выберите из списка"
                options={categoryOptions}
                searchable
                value={category}
                onChange={setCategory}
              />
              <Textarea
                label="Описание"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Расскажите, как проходит процедура"
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
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
                />
              </div>
              {/* Филиал вместо свободного текста: бэк хранит branch_id, а
                  название с адресом берёт из самого филиала. */}
              <Dropdown
                label="Филиал, где проводится процедура"
                placeholder={
                  branchOptions.length
                    ? "Выберите филиал"
                    : "У клиники нет филиалов"
                }
                options={branchOptions}
                value={branchId}
                onChange={setBranchId}
              />
            </div>
          ) : (
            <>
              <FieldRow label="Стоимость">
                {service.price ? `${service.price} с` : "—"}
              </FieldRow>
              <FieldRow label="Описание">{service.description || "—"}</FieldRow>
              <FieldRow label="Филиал">{service.branch?.name}</FieldRow>
              <FieldRow label="Адрес филиала">
                {service.branch?.address}
              </FieldRow>
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
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        closeOnConfirm={false}
        icon={<TrashIcon className="w-7 h-7" />}
        variant="danger"
        title="Удалить процедуру?"
        description="Действие нельзя отменить — процедура исчезнет из списка услуг клиники"
        confirmLabel="Удалить"
        cancelLabel="Отмена"
      />
    </>
  );
};
