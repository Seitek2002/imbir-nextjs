"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { DoctorPageLayout } from "@/widgets/doctor/layout";

import {
  type DoctorInvitationStatus,
  acceptDoctorInvitation,
  declineDoctorInvitation,
  doctorCabinetKeys,
  getDoctorInvitations,
} from "@/shared/api";
import { extractErrorMessage } from "@/shared/lib/errors";
import { Button } from "@/shared/ui";

const statusLabels: Record<DoctorInvitationStatus, string> = {
  pending: "Ожидает ответа",
  accepted: "Принято",
  declined: "Отклонено",
};

const errorMessage = (error: unknown) =>
  axios.isAxiosError(error)
    ? extractErrorMessage(
        error.response?.data,
        "Не удалось ответить на приглашение",
      )
    : "Не удалось ответить на приглашение";

export function DoctorInvitationsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"" | DoctorInvitationStatus>("pending");
  const [page, setPage] = useState(1);

  const invitationsQuery = useQuery({
    queryKey: doctorCabinetKeys.invitations(status, page),
    queryFn: () => getDoctorInvitations(status, page),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({
      queryKey: [...doctorCabinetKeys.all, "invitations"],
    });
    void queryClient.invalidateQueries({
      queryKey: doctorCabinetKeys.profile(),
    });
  };

  const acceptMutation = useMutation({
    mutationFn: acceptDoctorInvitation,
    onSuccess: () => {
      toast.success("Приглашение принято");
      setPage(1);
      refresh();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const declineMutation = useMutation({
    mutationFn: declineDoctorInvitation,
    onSuccess: () => {
      toast.success("Приглашение отклонено");
      setPage(1);
      refresh();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const isResponding = acceptMutation.isPending || declineMutation.isPending;

  return (
    <DoctorPageLayout title="Приглашения от клиник">
      <div className="rounded-3xl border border-border-soft bg-white p-5 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Приглашения от клиник
            </h2>
            <p className="mt-1 text-sm text-secondary">
              Решите, к какой клинике присоединиться.
            </p>
          </div>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as "" | DoctorInvitationStatus);
              setPage(1);
            }}
            aria-label="Статус приглашений"
            className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-foreground"
          >
            <option value="pending">Ожидают ответа</option>
            <option value="accepted">Принятые</option>
            <option value="declined">Отклонённые</option>
            <option value="">Все</option>
          </select>
        </div>

        {invitationsQuery.isPending && (
          <p className="mt-5 text-secondary">Загрузка приглашений…</p>
        )}
        {invitationsQuery.isError && (
          <p role="alert" className="mt-5 text-red-600">
            Не удалось загрузить приглашения.
          </p>
        )}
        {invitationsQuery.data?.data.length === 0 && (
          <p className="mt-5 text-secondary">Приглашений пока нет.</p>
        )}

        <div className="mt-4 space-y-3">
          {invitationsQuery.data?.data.map((invitation) => (
            <div
              key={invitation.id}
              className="rounded-2xl border border-border-soft p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">
                    {invitation.clinic_name}
                  </p>
                  {invitation.branch && (
                    <p className="mt-1 text-sm text-secondary">
                      Филиал:{" "}
                      {invitation.branch.name
                        ? `${invitation.branch.name}, `
                        : ""}
                      {invitation.branch.address}
                    </p>
                  )}
                  {invitation.message && (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
                      {invitation.message}
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-primary-tint px-3 py-1 text-xs text-primary">
                  {statusLabels[invitation.status]}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <time
                  className="text-xs text-secondary"
                  dateTime={invitation.created_at}
                >
                  {new Date(invitation.created_at).toLocaleDateString("ru-RU")}
                </time>
                {invitation.status === "pending" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={isResponding}
                      onClick={() => acceptMutation.mutate(invitation.id)}
                    >
                      Принять
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isResponding}
                      onClick={() => declineMutation.mutate(invitation.id)}
                    >
                      Отклонить
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {invitationsQuery.data &&
          invitationsQuery.data.pagination.total_pages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Назад
              </Button>
              <span className="text-sm text-secondary">
                {page} / {invitationsQuery.data.pagination.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= invitationsQuery.data.pagination.total_pages}
                onClick={() => setPage(page + 1)}
              >
                Далее
              </Button>
            </div>
          )}
      </div>
    </DoctorPageLayout>
  );
}
