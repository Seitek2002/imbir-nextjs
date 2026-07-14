"use client";

import { FC, useState } from "react";
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

type Props = {
  appointments: Appointment[];
  activeTab: "upcoming" | "completed";
};

export const ProfileHistory: FC<Props> = ({ appointments, activeTab }) => {
  const [appointmentsList, setAppointmentsList] = useState(appointments);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  const filteredAppointments = appointmentsList.filter((apt) =>
    activeTab === "upcoming"
      ? apt.status === "upcoming"
      : apt.status === "completed",
  );

  const queryClient = useQueryClient();
  const { mutate: cancel } = useMutation({
    mutationFn: (id: string) => cancelAppointment(Number(id)),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [...profileKeys.all, "appointments"],
      }),
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

  const { mutate: submitReview } = useMutation({
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
        text: vars.comment.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Спасибо за отзыв!");
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
      queryClient.invalidateQueries({ queryKey: profileKeys.reviews() });
    },
    onError: (err: unknown) => {
      const errData = (err as { response?: { data?: unknown } })?.response
        ?.data;
      toast.error(extractErrorMessage(errData, "Не удалось отправить отзыв"));
    },
  });

  const handleSubmitReview = (rating: number, comment: string) => {
    if (!selectedAppointment) return;
    if (!selectedAppointment.doctorId) {
      // Старые записи могли прийти без id врача — без цели отзыв не создать.
      toast.error("Не удалось определить врача для отзыва");
      return;
    }
    submitReview({ rating, comment, appointment: selectedAppointment });
  };

  if (filteredAppointments.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-border">
        <p className="text-muted text-lg">
          {activeTab === "upcoming"
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
          />
        ))}
      </div>

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
