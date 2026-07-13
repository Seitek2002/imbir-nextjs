"use client";

import { FC, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DoctorPageLayout } from "@/widgets/doctor/layout";

import {
  type DoctorServiceBody,
  type DoctorServiceItem,
  addDoctorService,
  deleteDoctorService,
  doctorCabinetKeys,
  getDoctorServices,
} from "@/shared/api";
import { ConfirmDialog, Modal } from "@/shared/ui";

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

const inp =
  "w-full px-4 py-3 rounded-2xl border border-border text-foreground placeholder:text-dim focus:outline-none focus:border-primary transition-colors";
const lbl = "block text-foreground text-sm font-medium mb-1.5";

type AddServiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (service: DoctorServiceBody) => void;
  isLoading?: boolean;
};

// Боттом-шит добавления услуги (общий Modal: снизу на телефоне, по центру на
// десктопе). Категория в макете не показывается, но обязательна на бэке —
// подставляем название услуги как категорию.
const AddServiceModal: FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  isLoading,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  const reset = () => {
    setName("");
    setDescription("");
    setPrice("");
    setDuration("");
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      category: name.trim(),
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
        <div>
          <label className={lbl}>Название услуги</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите название"
            className={inp}
          />
        </div>
        <div>
          <label className={lbl}>Описание услуги</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Введите описание"
            className={inp}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Стоимость, сом</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className={inp}
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
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-full border border-border-soft text-foreground font-medium hover:bg-background transition-colors active:scale-95"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || isLoading}
            className={`flex-1 py-3.5 rounded-full font-medium transition-colors ${
              name.trim() && !isLoading
                ? "bg-primary text-white hover:bg-primary-dark active:scale-95"
                : "bg-border text-dim cursor-not-allowed"
            }`}
          >
            {isLoading ? "Сохранение..." : "Добавить"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

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
    },
  });

  const services = data?.data ?? [];
  const th = "px-6 py-4 text-muted text-sm font-normal whitespace-nowrap";
  const td = "px-6 py-4 whitespace-nowrap";

  return (
    <>
      <DoctorPageLayout title="Услуги">
        {/* Десктоп: заголовок + кнопка добавления */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <h2 className="text-[32px] font-semibold text-foreground">Услуги</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 pl-4 pr-5 py-2.5 rounded-full border border-border bg-white text-foreground font-medium hover:border-primary hover:text-primary transition-colors"
          >
            <AddIcon />
            Добавить услугу
          </button>
        </div>

        <div className="pb-24 lg:pb-0">
          {isLoading ? (
            <div className="bg-white rounded-3xl border border-border px-6 py-16 text-center text-muted text-sm">
              Загрузка...
            </div>
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
                      <th className={th}>Название</th>
                      <th className={th}>Описание</th>
                      <th className={th}>Стоимость</th>
                      <th className={th}>Длительность</th>
                      <th className="px-6 py-4 w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((s) => (
                      <tr
                        key={s.id}
                        className="group border-b border-border last:border-0"
                      >
                        <td className={`${td} text-foreground font-medium`}>
                          {s.name}
                        </td>
                        <td className="px-6 py-4 text-muted">
                          {s.description || "—"}
                        </td>
                        <td className={`${td} text-foreground`}>
                          {s.price != null ? `${s.price} сом` : "—"}
                        </td>
                        <td className={`${td} text-foreground`}>
                          {s.duration != null ? `${s.duration} мин` : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setDeleteTarget(s)}
                            className="w-8 h-8 flex items-center justify-center text-dim hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                            aria-label="Удалить"
                          >
                            <TrashIcon />
                          </button>
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
        <button
          onClick={() => setModalOpen(true)}
          className="w-full py-3.5 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-colors active:scale-95 flex items-center justify-center gap-2"
        >
          <AddIcon className="text-white" />
          Добавить услугу
        </button>
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
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        icon={<TrashIcon className="text-primary w-6 h-6" />}
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
