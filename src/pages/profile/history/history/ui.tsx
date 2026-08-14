"use client";

import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ReviewModal } from "@/features/review-modal";

import {
  cancelAppointment,
  createReview,
  profileKeys,
  reviewKeys,
} from "@/shared/api";
import { WarningIcon } from "@/shared/assets/icons";
import { extractErrorMessage } from "@/shared/lib/errors";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

import type { Appointment, AppointmentStatus } from "./AppointmentCard/model";
import { AppointmentCard } from "./AppointmentCard/ui";
import { RescheduleModal } from "./RescheduleModal";

type Props = {
  appointments: Appointment[];
  activeTab: "upcoming" | "completed";
  // Строка из поиска в шапке — фильтруем на клиенте по врачу/клинике/услуге.
  searchQuery?: string;
};

export const ProfileHistory: FC<Props> = ({
  appointments,
  activeTab,
  searchQuery = "",
}) => {
  const [appointmentsList, setAppointmentsList] = useState(appointments);

  useEffect(() => {
    setAppointmentsList(appointments);
  }, [appointments]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(
    null,
  );

  const query = searchQuery.trim().toLowerCase();
  const filteredAppointments = appointmentsList.filter((apt) => {
    const byTab =
      activeTab === "upcoming"
        ? apt.status === "upcoming" ||
          apt.status === "pending" ||
          apt.status === "confirmed" ||
          apt.status === "scheduled"
        : apt.status === "completed";
    if (!byTab) return false;
    if (!query) return true;
    return [apt.doctorName, apt.doctorClinic, apt.service].some((field) =>
      field.toLowerCase().includes(query),
    );
  });

  const queryClient = useQueryClient();
  const { mutate: cancel } = useMutation({
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

  const handleCancelConfirm = () => {
    if (!cancelTarget) return;
    cancel(cancelTarget);
    setAppointmentsList((prev) =>
      prev.map((apt) =>
        apt.id === cancelTarget
          ? { ...apt, status: "cancelled" as AppointmentStatus }
          : apt,
      ),
    );
    setCancelTarget(null);
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
      rating: number;
      comment: string;
      appointment: Appointment;
    }) =>
      createReview({
        target_type: "doctor",
        target_id: Number(vars.appointment.doctorId),
        appointment_id: Number(vars.appointment.id),
        rating: vars.rating,
        text: vars.comment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
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
          isOnline={!!rescheduleTarget.isOnline}
        />
      )}

      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        icon={<WarningIcon className="w-7 h-7 [&_path]:stroke-primary" />}
        title="Отменить запись на приём?"
        description="История будет удалена без возможности восстановления"
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
