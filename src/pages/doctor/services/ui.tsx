"use client";

import { FC, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DoctorPageLayout } from "@/widgets/doctor/layout";

import { useServiceCategories } from "@/entities/service";

import {
  type DoctorServiceBody,
  type DoctorServiceItem,
  addDoctorService,
  deleteDoctorService,
  doctorCabinetKeys,
  getDoctorServices,
  updateDoctorService,
} from "@/shared/api";
import { EditIcon } from "@/shared/assets/icons";
import { extractErrorMessage } from "@/shared/lib/errors";
import { parsePrice } from "@/shared/lib/price";
import { cn } from "@/shared/lib/utils";
import {
  Button,
  ConfirmDialog,
  Dropdown,
  IconBtn,
  ImageWithFallback,
  Input,
  Modal,
  ViewModeToggle,
  useListView,
} from "@/shared/ui";

import { useDoctorClinics } from "./use-doctor-clinics";

// Нейтральная заглушка вместо фото — в стиле остальных плейсхолдеров проекта
// (приглушённая иконка на bg-surface), а не серый прямоугольник.
const ServicePhotoPlaceholder: FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`text-dim ${className ?? ""}`}
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="8.5" cy="10" r="1.5" fill="currentColor" />
    <path
      d="M4 17l4.5-4.5a2 2 0 0 1 2.8 0L16 17"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrashIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M2 4h12M5.333 4V2.667a.667.667 0 01.667-.667h4a.667.667 0 01.667.667V4M6.667 7.333v4M9.333 7.333v4M3.333 4l.667 9.333A1.333 1.333 0 005.333 14.667h5.334a1.333 1.333 0 001.333-1.334L12.667 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AddIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M8 3V13M3 8H13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

type ServiceModalProps = {
  isLoading?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (service: DoctorServiceBody) => void;
  // Заполнена — модалка работает на редактирование, пуста — на добавление.
  service?: DoctorServiceItem | null;
};

// Боттом-шит услуги (общий Modal: снизу на телефоне, по центру на десктопе).
// Специализацию выбираем из справочника: раньше поля не было и в category
// молча уезжало название услуги — из-за этого справочник
// /references/service-categories/ засорялся названиями вроде «Расшифровка ЭКГ».
const ServiceModal: FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  service,
  isLoading,
}) => {
  const isEdit = Boolean(service);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [clinicId, setClinicId] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>();
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Подставляем услугу при открытии — правкой стейта на рендере, а не
  // эффектом (react-hooks/set-state-in-effect). Ключ — id услуги, поэтому
  // повторное открытие той же карточки не затирает несохранённые правки,
  // а переключение на другую услугу перезаполняет форму.
  const formKey = isOpen ? (service?.id ?? "new") : null;
  const [prevKey, setPrevKey] = useState<null | number | string>(null);
  if (formKey !== prevKey) {
    setPrevKey(formKey);
    setName(service?.name ?? "");
    setCategory(service?.category ?? "");
    setDescription(service?.description ?? "");
    setPrice(service?.price ?? "");
    setDuration(service?.duration != null ? String(service.duration) : "");
    setClinicId(service?.clinic ? String(service.clinic.id) : "");
    setPhotoFile(null);
    setPhotoPreview(service?.photo ?? undefined);
  }

  const { options: categoryOptions, isLoading: isCategoriesLoading } =
    useServiceCategories();
  const {
    options: clinicOptions,
    isRequired: isClinicRequired,
    isLoading: isClinicsLoading,
  } = useDoctorClinics();

  const reset = () => {
    setName("");
    setCategory("");
    setDescription("");
    setPrice("");
    setDuration("");
    setClinicId("");
    setPhotoFile(null);
    setPhotoPreview(undefined);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    // Превью рисуем из data-URL, а на бэк уходит сам File (multipart).
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const canSubmit =
    !!name.trim() && !!category && (!isClinicRequired || !!clinicId);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      category,
      description: description || undefined,
      price: price ? String(price) : undefined,
      duration: duration ? Number(duration) : undefined,
      is_active: service?.is_active ?? true,
      // clinic_id шлём только когда врач сам выбирал клинику. При одной
      // клинике бэк подставляет её сам, а на правке пустое поле сбросило бы
      // уже привязанное место приёма.
      ...(isClinicRequired && clinicId ? { clinic_id: Number(clinicId) } : {}),
      // Новый файл шлём как File. Если фото не трогали, поле не отправляем
      // вовсе: PUT со строковым URL бэк принимает за загрузку файла и
      // отвечает «Загрузите правильное изображение».
      ...(photoFile ? { photo: photoFile } : {}),
    });
    if (!isEdit) reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Редактировать услугу" : "Добавить услугу"}
    >
      <div className="space-y-4">
        <Input
          label="Название услуги"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Введите название"
        />
        <Dropdown
          label="Категория услуги"
          placeholder={
            isCategoriesLoading ? "Загружаем список..." : "Выберите из списка"
          }
          options={categoryOptions}
          searchable
          value={category}
          onChange={setCategory}
        />
        {/* Клинику спрашиваем, только когда мест приёма несколько: одну бэк
            подставляет сам, при нуле услуга остаётся без клиники. Без этого
            поля врач с двумя клиниками получал 400 и не мог создать услугу. */}
        {isClinicRequired && (
          <Dropdown
            label="Клиника"
            placeholder={
              isClinicsLoading ? "Загружаем список..." : "Выберите из списка"
            }
            options={clinicOptions}
            value={clinicId}
            onChange={(val) => setClinicId(val as string)}
            hint="Вы принимаете в нескольких клиниках — укажите, к какой относится услуга"
          />
        )}
        <Input
          label="Описание услуги"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Введите описание"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Стоимость, сом"
            type="number"
            // Без min браузер пропускает минус, а бэк отрицательную цену
            // принимает как есть — услуга сохранялась с price "-500.00".
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
          />
          <Input
            label="Длительность, мин"
            type="number"
            min="0"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-foreground text-sm font-medium mb-1.5">
            Фото услуги
          </label>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhoto}
          />
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface flex items-center justify-center shrink-0">
              {photoPreview ? (
                <ImageWithFallback
                  src={photoPreview}
                  alt="Фото услуги"
                  width={80}
                  height={80}
                  unoptimized
                  loadingVariant="spinner"
                  className="w-full h-full object-cover"
                  fallback={<ServicePhotoPlaceholder className="size-8" />}
                />
              ) : (
                <ServicePhotoPlaceholder className="size-8" />
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => photoInputRef.current?.click()}
            >
              {photoPreview ? "Заменить фото" : "+ Добавить фото"}
            </Button>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={onClose}
          >
            Отмена
          </Button>
          <Button
            size="lg"
            className="flex-1"
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? "Сохранение..." : isEdit ? "Сохранить" : "Добавить"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const TH = "px-6 py-4 text-muted text-sm font-normal whitespace-nowrap";
const TD = "px-6 py-4 whitespace-nowrap";

// Заглушка повторяет саму таблицу — та же шапка и колонки, чтобы при
// появлении данных ничего не прыгало.
const ServicesSkeleton: FC<{ className?: string; showClinic?: boolean }> = ({
  className,
  showClinic = false,
}) => (
  <div
    className={cn(
      "bg-white rounded-3xl border border-border overflow-hidden",
      className,
    )}
  >
    <div className="overflow-x-auto">
      <table className="w-full min-w-160 text-left border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="px-6 py-4 w-20" />
            <th className={TH}>Название</th>
            <th className={TH}>Категория</th>
            {showClinic && <th className={TH}>Клиника</th>}
            <th className={TH}>Описание</th>
            <th className={TH}>Стоимость</th>
            <th className={TH}>Длительность</th>
            <th className="px-6 py-4 w-12" />
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 4 }).map((_, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              <td className={TD}>
                <div className="size-12 rounded-xl skeleton" />
              </td>
              <td className={TD}>
                <div className="h-4 w-40 rounded-md skeleton" />
              </td>
              <td className={TD}>
                <div className="h-4 w-28 rounded-md skeleton" />
              </td>
              {showClinic && (
                <td className={TD}>
                  <div className="h-4 w-32 rounded-md skeleton" />
                </td>
              )}
              <td className={TD}>
                <div className="h-4 w-48 rounded-md skeleton" />
              </td>
              <td className={TD}>
                <div className="h-4 w-20 rounded-md skeleton" />
              </td>
              <td className={TD}>
                <div className="h-4 w-16 rounded-md skeleton" />
              </td>
              <td className="px-6 py-4">
                <div className="size-5 rounded-md skeleton" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Мобильная карточка услуги. На узком экране таблица показывала только
// название: категория, цена, длительность и кнопки редактирования уходили за
// правый край, и добраться до них можно было лишь горизонтальным скроллом.
// У клиники такой список карточками уже был, у врача — нет.
const ServiceCard: FC<{
  onDelete: () => void;
  onEdit: () => void;
  service: DoctorServiceItem;
  showClinic: boolean;
}> = ({ onDelete, onEdit, service, showClinic }) => {
  const price = parsePrice(service.price);

  return (
    <div className="flex items-start gap-3 bg-white rounded-2xl border border-border p-3">
      <div className="size-14 rounded-xl overflow-hidden bg-surface flex items-center justify-center shrink-0">
        {service.photo ? (
          <ImageWithFallback
            src={service.photo}
            alt={service.name}
            width={56}
            height={56}
            className="w-full h-full object-cover"
            fallback={<ServicePhotoPlaceholder className="size-7" />}
          />
        ) : (
          <ServicePhotoPlaceholder className="size-7" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-foreground">
            {service.name}
          </h3>
          {price !== undefined && (
            <span className="text-sm font-semibold text-foreground shrink-0">
              {price} сом
            </span>
          )}
        </div>

        <p className="text-xs text-muted mt-0.5">
          {service.category || "Без категории"}
          {service.duration != null && ` • ${service.duration} мин`}
          {showClinic && service.clinic?.name && (
            <span className="text-primary"> • {service.clinic.name}</span>
          )}
        </p>

        {service.description && (
          <p className="text-xs text-muted mt-1 line-clamp-2">
            {service.description}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1 shrink-0">
        <IconBtn
          onClick={onEdit}
          variant="text"
          size="xs"
          className="text-dim hover:text-primary"
          aria-label="Редактировать"
        >
          <EditIcon />
        </IconBtn>
        <IconBtn
          onClick={onDelete}
          variant="text"
          size="xs"
          className="text-dim hover:text-red-500"
          aria-label="Удалить"
        >
          <TrashIcon />
        </IconBtn>
      </div>
    </div>
  );
};

// Заглушка мобильного списка — те же карточки, чтобы при загрузке данных
// ничего не прыгало.
const ServicesMobileSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div className={cn("flex flex-col gap-3", className)}>
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="flex items-start gap-3 bg-white rounded-2xl border border-border p-3"
      >
        <div className="size-14 rounded-xl skeleton shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 w-32 rounded-md skeleton" />
          <div className="h-3 w-24 rounded-md skeleton" />
          <div className="h-3 w-full rounded-md skeleton" />
        </div>
      </div>
    ))}
  </div>
);

export const DoctorServicesPage: FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  // Услуга, открытая на редактирование. null — модалка добавления.
  const [editTarget, setEditTarget] = useState<DoctorServiceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DoctorServiceItem | null>(
    null,
  );

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: doctorCabinetKeys.services(),
    queryFn: getDoctorServices,
  });

  const addMutation = useMutation({
    mutationFn: addDoctorService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorCabinetKeys.services() });
      toast.success("Услуга добавлена");
      setModalOpen(false);
    },
    // Без этого неудачное сохранение проходило совершенно молча: модалка
    // оставалась открытой, и было непонятно, ушло что-то или нет. Бэк
    // отвечает 400 с полями (например «Загрузите правильное изображение»).
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      toast.error(extractErrorMessage(data, "Не удалось добавить услугу"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ body, id }: { body: DoctorServiceBody; id: number }) =>
      updateDoctorService(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorCabinetKeys.services() });
      toast.success("Услуга обновлена");
      closeModal();
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      toast.error(extractErrorMessage(data, "Не удалось сохранить услугу"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteDoctorService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorCabinetKeys.services() });
      toast.success("Услуга удалена");
    },
    onError: () => toast.error("Не удалось удалить услугу"),
  });

  const services = data?.data ?? [];
  // Колонку и дропдаун показываем по одному правилу: только когда мест
  // приёма несколько и привязка перестаёт быть очевидной.
  const { isRequired: showClinicColumn } = useDoctorClinics();
  const {
    mode: viewMode,
    setMode: setViewMode,
    cardsClassName,
    tableClassName,
  } = useListView();

  return (
    <>
      <DoctorPageLayout title="Услуги">
        {/* Заголовок и кнопка добавления — только на десктопе: на телефоне
            заголовок в шапке макета, а кнопка закреплена снизу. Переключатель
            вида нужен на всех ширинах, поэтому строка одна на всех. */}
        <div className="flex items-center gap-3 mb-4 lg:mb-6">
          <h2 className="hidden lg:block text-[32px] font-semibold text-foreground">
            Услуги
          </h2>
          <div className="flex items-center gap-3 ml-auto">
            <ViewModeToggle mode={viewMode} onChange={setViewMode} />
            <div className="hidden lg:block">
              <Button
                variant="outline"
                size="sm"
                IconLeft={AddIcon}
                onClick={() => setModalOpen(true)}
              >
                Добавить услугу
              </Button>
            </div>
          </div>
        </div>

        <div className="pb-24 lg:pb-0">
          {isLoading ? (
            <>
              <ServicesMobileSkeleton className={cardsClassName} />
              <ServicesSkeleton
                className={tableClassName}
                showClinic={showClinicColumn}
              />
            </>
          ) : services.length === 0 ? (
            <div className="bg-white rounded-3xl border border-border px-6 py-16 text-center text-muted text-sm">
              Услуг пока нет
            </div>
          ) : (
            <>
              <div className={cn("flex flex-col gap-3", cardsClassName)}>
                {services.map((s) => (
                  <ServiceCard
                    key={s.id}
                    service={s}
                    showClinic={showClinicColumn}
                    onEdit={() => {
                      setEditTarget(s);
                      setModalOpen(true);
                    }}
                    onDelete={() => setDeleteTarget(s)}
                  />
                ))}
              </div>

              <div
                className={cn(
                  "bg-white rounded-3xl border border-border overflow-hidden",
                  tableClassName,
                )}
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-160 text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-6 py-4 w-20" />
                        <th className={TH}>Название</th>
                        <th className={TH}>Категория</th>
                        {/* Колонка только у врачей с несколькими местами приёма:
                          у остальных во всех строках стояло бы одно и то же. */}
                        {showClinicColumn && <th className={TH}>Клиника</th>}
                        <th className={TH}>Описание</th>
                        <th className={TH}>Стоимость</th>
                        <th className={TH}>Длительность</th>
                        <th className="px-6 py-4 w-12" />
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((s) => (
                        <tr
                          key={s.id}
                          className="group border-b border-border last:border-0"
                        >
                          <td className={TD}>
                            <div className="size-12 rounded-xl overflow-hidden bg-surface flex items-center justify-center">
                              {s.photo ? (
                                <ImageWithFallback
                                  src={s.photo}
                                  alt={s.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                  fallback={
                                    <ServicePhotoPlaceholder className="size-6" />
                                  }
                                />
                              ) : (
                                <ServicePhotoPlaceholder className="size-6" />
                              )}
                            </div>
                          </td>
                          <td className={`${TD} text-foreground font-medium`}>
                            {s.name}
                          </td>
                          <td className={`${TD} text-muted`}>
                            {s.category || "—"}
                          </td>
                          {showClinicColumn && (
                            <td className={`${TD} text-muted`}>
                              {s.clinic?.name ?? "—"}
                              {s.branch && (
                                <span className="text-dim">
                                  {" "}
                                  • {s.branch.name}
                                </span>
                              )}
                            </td>
                          )}
                          <td className="px-6 py-4 text-muted">
                            {s.description || "—"}
                          </td>
                          <td className={`${TD} text-foreground`}>
                            {/* Бэк отдаёт цену строкой с копейками («1200.00») — прогоняем
                                через parsePrice, иначе в таблице висят нули,
                                которых нет в карточках. */}
                            {parsePrice(s.price) !== undefined
                              ? `${parsePrice(s.price)} сом`
                              : "—"}
                          </td>
                          <td className={`${TD} text-foreground`}>
                            {s.duration != null ? `${s.duration} мин` : "—"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <IconBtn
                                onClick={() => {
                                  setEditTarget(s);
                                  setModalOpen(true);
                                }}
                                variant="text"
                                size="xs"
                                className="text-dim hover:text-primary opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                aria-label="Редактировать"
                              >
                                <EditIcon />
                              </IconBtn>
                              <IconBtn
                                onClick={() => setDeleteTarget(s)}
                                variant="text"
                                size="xs"
                                className="text-dim hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                aria-label="Удалить"
                              >
                                <TrashIcon />
                              </IconBtn>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </DoctorPageLayout>

      {/* Мобайл: кнопка добавления закреплена снизу */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 p-4 bg-[#FAFAFA] z-30">
        <Button
          size="lg"
          className="w-full"
          IconLeft={AddIcon}
          onClick={() => setModalOpen(true)}
        >
          Добавить услугу
        </Button>
      </div>

      <ServiceModal
        isOpen={modalOpen}
        onClose={closeModal}
        service={editTarget}
        onSubmit={(body) =>
          editTarget
            ? updateMutation.mutate({ id: editTarget.id, body })
            : addMutation.mutate(body)
        }
        isLoading={addMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          // Диалог закроется сам только после успешного удаления.
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
        isLoading={deleteMutation.isPending}
        closeOnConfirm={false}
        icon={<TrashIcon className="w-6 h-6" />}
        variant="danger"
        title="Удалить услугу?"
        description={
          deleteTarget
            ? `«${deleteTarget.name}» будет удалена без возможности восстановления.`
            : undefined
        }
        confirmLabel="Удалить"
      />
    </>
  );
};
