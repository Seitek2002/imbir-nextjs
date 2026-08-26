"use client";

import { FC, useState } from "react";
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
} from "@/shared/api";
import {
  Button,
  ConfirmDialog,
  Dropdown,
  IconBtn,
  Input,
  Modal,
} from "@/shared/ui";

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

type AddServiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (service: DoctorServiceBody) => void;
  isLoading?: boolean;
};

// Боттом-шит добавления услуги (общий Modal: снизу на телефоне, по центру на
// десктопе). Специализацию выбираем из справочника: раньше поля не было и в
// category молча уезжало название услуги — из-за этого справочник
// /references/service-categories/ засорялся названиями вроде «Расшифровка ЭКГ».
const AddServiceModal: FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  isLoading,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  const { options: categoryOptions, isLoading: isCategoriesLoading } =
    useServiceCategories();

  const reset = () => {
    setName("");
    setCategory("");
    setDescription("");
    setPrice("");
    setDuration("");
  };

  const canSubmit = !!name.trim() && !!category;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onAdd({
      name: name.trim(),
      category,
      description: description || undefined,
      price: price ? String(price) : undefined,
      duration: duration ? Number(duration) : undefined,
      is_active: true,
    });
    reset();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Добавить услугу">
      <div className="space-y-4">
        <Input
          label="Название услуги"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Введите название"
        />
        <Dropdown
          label="Специализация"
          placeholder={
            isCategoriesLoading ? "Загружаем список..." : "Выберите из списка"
          }
          options={categoryOptions}
          searchable
          value={category}
          onChange={setCategory}
        />
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
            {isLoading ? "Сохранение..." : "Добавить"}
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
const ServicesSkeleton: FC = () => (
  <div className="bg-white rounded-3xl border border-border overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-160 text-left border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className={TH}>Название</th>
            <th className={TH}>Специализация</th>
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
                <div className="h-4 w-40 rounded-md skeleton" />
              </td>
              <td className={TD}>
                <div className="h-4 w-28 rounded-md skeleton" />
              </td>
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

export const DoctorServicesPage: FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DoctorServiceItem | null>(
    null,
  );
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: doctorCabinetKeys.services(),
    queryFn: getDoctorServices,
  });

  const addMutation = useMutation({
    mutationFn: addDoctorService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorCabinetKeys.services() });
      setModalOpen(false);
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

  return (
    <>
      <DoctorPageLayout title="Услуги">
        {/* Десктоп: заголовок + кнопка добавления */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <h2 className="text-[32px] font-semibold text-foreground">Услуги</h2>
          <Button
            variant="outline"
            size="sm"
            IconLeft={AddIcon}
            onClick={() => setModalOpen(true)}
          >
            Добавить услугу
          </Button>
        </div>

        <div className="pb-24 lg:pb-0">
          {isLoading ? (
            <ServicesSkeleton />
          ) : services.length === 0 ? (
            <div className="bg-white rounded-3xl border border-border px-6 py-16 text-center text-muted text-sm">
              Услуг пока нет
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-160 text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className={TH}>Название</th>
                      <th className={TH}>Специализация</th>
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
                        <td className={`${TD} text-foreground font-medium`}>
                          {s.name}
                        </td>
                        <td className={`${TD} text-muted`}>
                          {s.category || "—"}
                        </td>
                        <td className="px-6 py-4 text-muted">
                          {s.description || "—"}
                        </td>
                        <td className={`${TD} text-foreground`}>
                          {s.price != null ? `${s.price} сом` : "—"}
                        </td>
                        <td className={`${TD} text-foreground`}>
                          {s.duration != null ? `${s.duration} мин` : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <IconBtn
                            onClick={() => setDeleteTarget(s)}
                            variant="text"
                            size="xs"
                            className="text-dim hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                            aria-label="Удалить"
                          >
                            <TrashIcon />
                          </IconBtn>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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

      <AddServiceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addMutation.mutate}
        isLoading={addMutation.isPending}
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
