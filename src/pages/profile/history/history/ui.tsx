"use client";

import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";

import Link from "next/link";

import {
  type InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { ReviewModal } from "@/features/review-modal";
import { useInvalidateAfterReview } from "@/features/submit-review";

import { cancelAppointment, createReview, profileKeys } from "@/shared/api";
import type { PaginatedResponse, ProfileAppointment } from "@/shared/api";
import { WarningIcon } from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config";
import { extractErrorMessage } from "@/shared/lib/errors";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

import type { Appointment, AppointmentStatus } from "./AppointmentCard/model";
import { AppointmentCard } from "./AppointmentCard/ui";
import { RescheduleModal } from "./RescheduleModal";

// Отзыв — врачу; если запись без врача (только клиника) — клинике.
const reviewTarget = (apt: Appointment) =>
  apt.doctorId
    ? { target_type: "doctor" as const, target_id: Number(apt.doctorId) }
    : { target_type: "clinic" as const, target_id: Number(apt.clinicId) };

type Props = {
  activeTab: "completed" | "upcoming";
  appointments: Appointment[];
  // Строка из поиска в шапке — фильтруем на клиенте по врачу/клинике/услуге.
  searchQuery?: string;
  // Только для вкладки "Прошедшие": сужает список до конкретного статуса
  // (там показаны и завершённые, и отменённые записи вместе).
  statusFilter?: "cancelled" | "completed";
};

export const ProfileHistory: FC<Props> = ({
  appointments,
  activeTab,
  searchQuery = "",
  statusFilter,
}) => {
  const [appointmentsList, setAppointmentsList] = useState(appointments);

  useEffect(() => {
    setAppointmentsList(appointments);
  }, [appointments]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<null | string>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(
    null,
  );

  const query = searchQuery.trim().toLowerCase();
  const filteredAppointments = appointmentsList.filter((apt) => {
    // "Прошедшие" объединяет завершённые, отменённые и просроченные записи —
    // statusFilter сужает до одного статуса. Вкладку записи знает бэк
    // (isPast); старый бэк её не отдаёт — тогда решаем по статусу.
    const isActiveStatus =
      apt.status === "upcoming" ||
      apt.status === "pending" ||
      apt.status === "confirmed" ||
      apt.status === "scheduled";
    const isPast = apt.isPast ?? !isActiveStatus;
    const byTab = activeTab === "upcoming" ? isActiveStatus && !isPast : isPast;
    if (!byTab) return false;
    if (statusFilter && apt.status !== statusFilter) return false;
    if (!query) return true;
    return [apt.doctorName, apt.doctorClinic, apt.service].some((field) =>
      field.toLowerCase().includes(query),
    );
  });

  const queryClient = useQueryClient();
  const invalidateAfterReview = useInvalidateAfterReview();
  const { mutateAsync: cancel, isPending: isCancelling } = useMutation({
    mutationFn: (id: string) => cancelAppointment(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...profileKeys.all, "appointments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["record-available-slots"],
      });
      queryClient.invalidateQueries({
        queryKey: ["reschedule-available-slots"],
      });
      toast.success("Запись отменена");
    },
  });

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    try {
      await cancel(cancelTarget);
      setAppointmentsList((prev) =>
        prev.map((apt) =>
          apt.id === cancelTarget
            ? { ...apt, status: "cancelled" as AppointmentStatus }
            : apt,
        ),
      );
      setCancelTarget(null);
    } catch (err: unknown) {
      // Запрос не удался — диалог остаётся открытым, isCancelling сам сбросится.
      const errData = (err as { response?: { data?: unknown } })?.response
        ?.data;
      toast.error(extractErrorMessage(errData, "Не удалось отменить запись"));
    }
  };

  const handleOpenReviewModal = (id: string) => {
    const apt = appointmentsList.find((a) => a.id === id);
    if (apt) {
      setSelectedAppointment(apt);
      setReviewModalOpen(true);
    }
  };

  const { mutateAsync: submitReview } = useMutation({
    mutationFn: (vars: {
      appointment: Appointment;
      comment: string;
      rating: number;
    }) =>
      createReview({
        ...reviewTarget(vars.appointment),
        appointment_id: Number(vars.appointment.id),
        rating: vars.rating,
        text: vars.comment,
      }),
    onSuccess: (_review, vars) => {
      // Та же тройка сбросов, что на страницах врача и клиники
      // (features/submit-review). Раньше здесь сбрасывался весь reviewKeys.all;
      // теперь только список того врача, кому оставили отзыв.
      const target = reviewTarget(vars.appointment);
      invalidateAfterReview(target.target_type, target.target_id);
      // Отзыв один на врача (клинику): кнопка пропадает и у этой записи, и у
      // остальных приёмов у него. can_review перечитываем с бэка.
      const sameTarget = (doctorId: string, clinicId: string) =>
        target.target_type === "doctor"
          ? doctorId === vars.appointment.doctorId
          : !doctorId && clinicId === vars.appointment.clinicId;
      setAppointmentsList((prev) =>
        prev.map((apt) =>
          sameTarget(apt.doctorId, apt.clinicId)
            ? { ...apt, canReview: false }
            : apt,
        ),
      );
      // И в кеше: иначе родитель на старте перезапроса отдаст старые записи,
      // и кнопка мигнёт обратно, пока бэк не ответит.
      queryClient.setQueriesData<
        InfiniteData<PaginatedResponse<ProfileAppointment>>
      >({ queryKey: [...profileKeys.all, "appointments"] }, (old) =>
        old && Array.isArray(old.pages)
          ? {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((a) =>
                  sameTarget(
                    a.doctor ? String(a.doctor.id) : "",
                    a.clinic ? String(a.clinic.id) : "",
                  )
                    ? { ...a, can_review: false }
                    : a,
                ),
              })),
            }
          : old,
      );
      queryClient.invalidateQueries({
        queryKey: [...profileKeys.all, "appointments"],
      });
      toast.success("Отзыв сохранён");
      setReviewModalOpen(false);
      setSelectedAppointment(null);
    },
    onError: (err: unknown) => {
      const errData = (err as { response?: { data?: unknown } })?.response
        ?.data;
      toast.error(extractErrorMessage(errData, "Не удалось сохранить отзыв"));
    },
  });

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!selectedAppointment) return;
    // Возвращаем промис: модалка закроется только после успешной отправки.
    return submitReview({
      rating,
      comment,
      appointment: selectedAppointment,
    });
  };

  if (filteredAppointments.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-border">
        <p className="text-muted text-lg">
          {query
            ? "По вашему запросу ничего не найдено"
            : activeTab === "upcoming"
              ? "У вас нет предстоящих записей"
              : "У вас нет прошедших записей"}
        </p>
        {!query && activeTab === "upcoming" && (
          <Link
            href={ROUTES.RECORD}
            className="font-medium flex items-center justify-center gap-2 transition-all rounded-full outline-none focus-visible:shadow-[0_0_1px_3px_rgba(245,101,62,0.45)] bg-primary text-white active:bg-primary-dark hover:shadow-[0_0_1px_3px_rgba(245,101,62,0.3)] h-12 px-8 text-base mt-6 mx-auto w-fit"
          >
            Записаться
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {filteredAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onCancel={
              activeTab === "upcoming" ? (id) => setCancelTarget(id) : undefined
            }
            onReview={
              activeTab === "completed" ? handleOpenReviewModal : undefined
            }
            onReschedule={
              activeTab === "upcoming"
                ? (id) =>
                    setRescheduleTarget(
                      appointmentsList.find((a) => a.id === id) ?? null,
                    )
                : undefined
            }
          />
        ))}
      </div>

      {rescheduleTarget && (
        <RescheduleModal
          isOpen={!!rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          appointmentId={rescheduleTarget.id}
          doctorId={rescheduleTarget.doctorId}
          serviceId={rescheduleTarget.serviceId}
          serviceDuration={rescheduleTarget.serviceDuration}
        />
      )}

      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        isLoading={isCancelling}
        closeOnConfirm={false}
        icon={<WarningIcon className="w-7 h-7 [&_path]:stroke-primary" />}
        title="Отменить запись на приём?"
        description="Запись будет отменена и останется в истории со статусом «Отменено»"
        confirmLabel="Да, отменить"
        cancelLabel="Назад"
      />

      {selectedAppointment && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedAppointment(null);
          }}
          title="Отзыв"
          doctorName={selectedAppointment.doctorName}
          doctorSpecialty={selectedAppointment.doctorSpecialty}
          doctorClinic={selectedAppointment.doctorClinic}
          doctorImage={selectedAppointment.doctorImage}
          onSubmit={handleSubmitReview}
        />
      )}
    </>
  );
};
