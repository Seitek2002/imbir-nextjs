"use client";

import { FC, useState } from "react";

import { ReviewModal } from "@/features/review-modal";

import { AppointmentCard } from "@/entities/appointment";
import type { Appointment, AppointmentStatus } from "@/entities/appointment";

type Props = {
  appointments: Appointment[];
  activeTab: "upcoming" | "completed";
};

export const ProfileHistory: FC<Props> = ({ appointments, activeTab }) => {
  const [appointmentsList, setAppointmentsList] = useState(appointments);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const filteredAppointments = appointmentsList.filter((apt) =>
    activeTab === "upcoming"
      ? apt.status === "upcoming"
      : apt.status === "completed",
  );

  const handleCancel = (id: string) => {
    console.log("Cancel appointment:", id);
    // TODO: API call to cancel
    setAppointmentsList((prev) =>
      prev.map((apt) =>
        apt.id === id
          ? { ...apt, status: "cancelled" as AppointmentStatus }
          : apt,
      ),
    );
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
    // TODO: API call to submit review
  };

  if (filteredAppointments.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-[#E5E6E8]">
        <p className="text-[#838A8D] text-lg">
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
            onCancel={activeTab === "upcoming" ? handleCancel : undefined}
            onReview={
              activeTab === "completed" ? handleOpenReviewModal : undefined
            }
          />
        ))}
      </div>

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
