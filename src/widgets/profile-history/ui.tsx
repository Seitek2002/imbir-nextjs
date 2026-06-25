"use client";

import { FC, useState } from "react";

import { ReviewModal } from "@/features/review-modal";

import { AppointmentCard } from "@/entities/appointment";
import type { Appointment, AppointmentStatus } from "@/entities/appointment";

import { WarningIcon } from "@/shared/assets/icons";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

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

  const handleCancelConfirm = () => {
    if (!cancelTarget) return;
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

  const handleSubmitReview = (rating: number, comment: string) => {
    console.log("Submit review:", { rating, comment });
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
