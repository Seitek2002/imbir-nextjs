"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { useParams, useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ClinicSidebar } from "@/widgets/clinic/layout";

import { useClinicCabinet } from "@/entities/clinic-profile";

import {
  type ClinicServiceBody,
  type ServiceListItem,
  clinicCabinetKeys,
  deleteClinicService,
  getClinicServices,
  updateClinicService,
} from "@/shared/api";
import { WarningIcon } from "@/shared/assets/icons";
import { colors } from "@/shared/config";
import { ConfirmDialog } from "@/shared/ui";

type FormState = {
  name: string;
  category: string;
  price: string;
  duration: string;
};

const inp =
  "w-full px-4 py-3 rounded-2xl border border-border text-foreground placeholder:text-dim focus:outline-none focus:border-primary transition-colors bg-white text-base";
const lbl = "block text-muted text-xs mb-1";

export default function EditProcedurePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>() ?? { id: "" };
  const serviceId = Number(params.id);
  const { profile } = useClinicCabinet();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [nameError, setNameError] = useState(false);

  // Отдельного GET /api/clinic/services/{id}/ нет — берём из общего списка.
  const { data, isLoading } = useQuery({
    queryKey: clinicCabinetKeys.services(),
    queryFn: getClinicServices,
  });
  const service = (data?.data ?? []).find((s) => s.id === serviceId) ?? null;

  // Инициализация формы из найденной услуги (adjust-state-during-render).
  const [synced, setSynced] = useState<ServiceListItem | null>(null);
  if (service && service !== synced) {
    setSynced(service);
    setForm({
      name: service.name,
      category: service.category ?? "",
      price: service.price ?? "",
      duration: service.duration != null ? String(service.duration) : "",
    });
  }

  const saveMutation = useMutation({
    mutationFn: (body: ClinicServiceBody) =>
      updateClinicService(serviceId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicCabinetKeys.services() });
      toast.success("Процедура сохранена");
      router.push("/clinic-profile/procedures");
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

  const handleSave = () => {
    if (!form) return;
    if (!form.name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    saveMutation.mutate({
      name: form.name.trim(),
      category: form.category.trim(),
      price: form.price.trim() || undefined,
      duration: form.duration ? Number(form.duration) : undefined,
      is_active: true,
    });
  };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  return (
    <div className="w-full max-w-360 mx-auto px-4 md:px-10 py-8">
      <h1 className="text-[40px] font-semibold text-foreground mb-8">
        Мой профиль
      </h1>

      <div className="flex gap-6">
        <ClinicSidebar
          clinicName={profile?.name ?? ""}
          clinicLogo={profile?.logo}
          rating={profile?.rating}
        />

        <main className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
              aria-label="Назад"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke={colors.foreground}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <h2 className="text-[32px] font-semibold text-foreground flex-1">
              Редактировать процедуру
            </h2>

            <button
              onClick={handleSave}
              disabled={saveMutation.isPending || !form}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
                saveMutation.isPending || !form
                  ? "bg-dim text-white cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              {saveMutation.isPending ? "Сохранение..." : "Сохранить"}
            </button>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-3xl border border-border px-5 py-12 text-center text-muted">
              Загрузка...
            </div>
          ) : !service || !form ? (
            <div className="bg-white rounded-3xl border border-border px-5 py-12 text-center text-muted">
              Процедура не найдена
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-border p-5 lg:p-8 flex flex-col gap-4">
              <div>
                <label className={lbl}>Название процедуры</label>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Введите название"
                  className={`${inp} ${nameError ? "border-red-400" : ""}`}
                />
                {nameError && (
                  <p className="text-xs text-red-500 mt-1">
                    Название обязательно
                  </p>
                )}
              </div>

              <div>
                <label className={lbl}>Категория / специализация</label>
                <input
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  placeholder="Например: Гастроэнтерология"
                  className={inp}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Цена, сом</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="0"
                    className={inp}
                  />
                </div>
                <div>
                  <label className={lbl}>Длительность, минут</label>
                  <input
                    type="number"
                    min="0"
                    value={form.duration}
                    onChange={(e) => set("duration", e.target.value)}
                    placeholder="30"
                    className={inp}
                  />
                </div>
              </div>

              <p className="text-xs text-muted">
                Фото процедуры и её расписание — в разработке (ждём поля на
                бэкенде).
              </p>

              <div className="border-t border-background pt-4">
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={deleteMutation.isPending}
                  className="text-red-500 text-sm font-medium hover:underline disabled:opacity-50"
                >
                  {deleteMutation.isPending
                    ? "Удаление..."
                    : "Удалить процедуру"}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          deleteMutation.mutate();
        }}
        icon={<WarningIcon className="w-7 h-7 [&_path]:stroke-primary" />}
        title="Удалить процедуру?"
        description="Действие нельзя отменить — процедура исчезнет из списка услуг клиники"
        confirmLabel="Да, удалить"
        cancelLabel="Назад"
      />
    </div>
  );
}
