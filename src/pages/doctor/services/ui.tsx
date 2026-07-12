"use client";

import { FC, useCallback, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DoctorPageLayout } from "@/widgets/doctor/layout";

import {
  type DoctorServiceBody,
  addDoctorService,
  deleteDoctorService,
  doctorCabinetKeys,
  getDoctorServices,
} from "@/shared/api";
import { colors } from "@/shared/config";
import { useScrollLock } from "@/shared/lib/useScrollLock";

const DURATION = 200;

type AddServiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (service: DoctorServiceBody) => void;
  isLoading?: boolean;
};

const AddServiceModal: FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  isLoading,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  useScrollLock(isOpen);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, DURATION);
  }, [onClose]);

  const handleSubmit = () => {
    // category обязателен на бэке; price уходит строкой, длительность — duration
    if (!name.trim() || !category.trim()) return;
    onAdd({
      name: name.trim(),
      category: category.trim(),
      description: description || undefined,
      price: price ? String(price) : undefined,
      duration: duration ? Number(duration) : undefined,
      is_active: true,
    });
    setName("");
    setCategory("");
    setDescription("");
    setPrice("");
    setDuration("");
  };

  if (!isOpen && !isClosing) return null;
  const state = isClosing ? "closed" : "open";

  const inp =
    "w-full px-4 py-3 rounded-2xl border border-border text-foreground placeholder:text-dim focus:outline-none focus:border-primary transition-colors";
  const lbl = "block text-muted text-sm mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="modal-overlay absolute inset-0 bg-black/50"
        data-state={state}
        onClick={handleClose}
      />
      <div
        className="modal-panel relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md overflow-hidden"
        data-state={state}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Добавить услугу
          </h2>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5"
                stroke={colors.secondary}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
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
            <label className={lbl}>Категория</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Например, Приём, Диагностика"
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
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !category.trim() || isLoading}
            className={`w-full py-3.5 rounded-full font-medium transition-colors ${
              name.trim() && category.trim() && !isLoading
                ? "bg-primary text-white hover:bg-primary-dark active:scale-95"
                : "bg-border text-dim cursor-not-allowed"
            }`}
          >
            {isLoading ? "Сохранение..." : "Добавить"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const DoctorServicesPage: FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
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

  return (
    <>
      <DoctorPageLayout
        title="Услуги"
        headerRight={
          <button
            onClick={() => setModalOpen(true)}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary-dark transition-colors"
            aria-label="Добавить услугу"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4V16M4 10H16"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        }
      >
        <div className="hidden lg:flex items-center justify-between mb-6">
          <h2 className="text-[32px] font-semibold text-foreground">Услуги</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 pl-4 pr-5 py-2.5 rounded-full border border-border bg-white text-foreground font-medium hover:border-primary hover:text-primary transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3V13M3 8H13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Добавить услугу
          </button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl border border-border px-6 py-16 text-center text-muted text-sm">
            Загрузка...
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-3xl border border-border px-6 py-16 text-center text-muted text-sm">
            Услуг пока нет
          </div>
        ) : (
          <>
            {/* ── Desktop: таблица ─────────────────────────────── */}
            <div className="hidden md:block bg-white rounded-3xl border border-border overflow-hidden">
              <div className="grid grid-cols-[1.3fr_2fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-border">
                <span className="text-muted text-sm">Название</span>
                <span className="text-muted text-sm">Описание</span>
                <span className="text-muted text-sm">Стоимость</span>
                <span className="text-muted text-sm">Длительность</span>
                <span className="w-8" />
              </div>

              {services.map((s, i) => (
                <div
                  key={s.id}
                  className={`group grid grid-cols-[1.3fr_2fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center ${
                    i !== services.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <span className="text-foreground font-medium">{s.name}</span>
                  <span className="text-muted">{s.description || "—"}</span>
                  <span className="text-foreground">
                    {s.price != null ? `${s.price} сом` : "—"}
                  </span>
                  <span className="text-foreground">
                    {s.duration != null ? `${s.duration} мин` : "—"}
                  </span>
                  <button
                    onClick={() => deleteMutation.mutate(s.id)}
                    disabled={deleteMutation.isPending}
                    className="w-8 h-8 flex items-center justify-center text-dim hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Удалить"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M2 4h12M5.333 4V2.667a.667.667 0 01.667-.667h4a.667.667 0 01.667.667V4M6.667 7.333v4M9.333 7.333v4M3.333 4l.667 9.333A1.333 1.333 0 005.333 14.667h5.334a1.333 1.333 0 001.333-1.334L12.667 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* ── Mobile: карточки ─────────────────────────────── */}
            <div className="md:hidden flex flex-col gap-3">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border border-border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-foreground font-medium">
                      {s.name}
                    </span>
                    <button
                      onClick={() => deleteMutation.mutate(s.id)}
                      disabled={deleteMutation.isPending}
                      className="w-7 h-7 flex items-center justify-center text-dim hover:text-red-500 shrink-0"
                      aria-label="Удалить"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M2 4h12M5.333 4V2.667a.667.667 0 01.667-.667h4a.667.667 0 01.667.667V4M6.667 7.333v4M9.333 7.333v4M3.333 4l.667 9.333A1.333 1.333 0 005.333 14.667h5.334a1.333 1.333 0 001.333-1.334L12.667 4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                  {s.description && (
                    <p className="text-muted text-sm mt-1">{s.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="text-foreground font-medium">
                      {s.price != null ? `${s.price} сом` : "—"}
                    </span>
                    <span className="text-muted">
                      {s.duration != null ? `${s.duration} мин` : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </DoctorPageLayout>

      <AddServiceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addMutation.mutate}
        isLoading={addMutation.isPending}
      />
    </>
  );
};
