"use client";

import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

import Link from "next/link";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { ClinicPageLayout } from "@/widgets/clinic/layout";

import { useClinicCabinet } from "@/entities/clinic-profile";

import {
  type DoctorInvitationStatus,
  cancelDoctorInvitation,
  clinicCabinetKeys,
  createDoctorInvitation,
  doctorKeys,
  getClinicDoctorInvitations,
  getDoctors,
} from "@/shared/api";
import type { DoctorListItem } from "@/shared/api";
import { extractErrorMessage } from "@/shared/lib/errors";
import { Button, Textarea } from "@/shared/ui";

const errorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error)
    ? extractErrorMessage(error.response?.data, fallback)
    : fallback;

const statusLabels: Record<DoctorInvitationStatus, string> = {
  pending: "Ожидает ответа",
  accepted: "Принято",
  declined: "Отклонено",
};

export function ClinicDoctorInvitationsPage() {
  const queryClient = useQueryClient();
  const { rawProfile } = useClinicCabinet();
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorListItem | null>(
    null,
  );
  const [manualDoctorId, setManualDoctorId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"" | DoctorInvitationStatus>("pending");
  const [page, setPage] = useState(1);
  const hasManualDoctorId =
    /^[1-9]\d*$/.test(manualDoctorId) &&
    Number.isSafeInteger(Number(manualDoctorId));

  const doctorsQuery = useQuery({
    queryKey: doctorKeys.list({ search: submittedSearch, page_size: 20 }),
    queryFn: () => getDoctors({ search: submittedSearch, page_size: 20 }),
    enabled: submittedSearch.length >= 2,
  });

  const invitationsQuery = useQuery({
    queryKey: clinicCabinetKeys.doctorInvitations(status, page),
    queryFn: () => getClinicDoctorInvitations(status, page),
  });

  const refreshInvitations = () =>
    queryClient.invalidateQueries({
      queryKey: [...clinicCabinetKeys.all, "doctor-invitations"],
    });

  const createMutation = useMutation({
    mutationFn: (doctorId: number) =>
      createDoctorInvitation({
        doctor_id: doctorId,
        ...(branchId ? { branch_id: Number(branchId) } : {}),
        ...(message.trim() ? { message: message.trim() } : {}),
      }),
    onSuccess: () => {
      toast.success("Приглашение отправлено врачу");
      setSelectedDoctor(null);
      setManualDoctorId("");
      setSearch("");
      setSubmittedSearch("");
      setBranchId("");
      setMessage("");
      setPage(1);
      setStatus("pending");
      void refreshInvitations();
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Не удалось отправить приглашение")),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelDoctorInvitation,
    onSuccess: () => {
      toast.success("Приглашение отменено");
      void refreshInvitations();
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Не удалось отменить приглашение")),
  });

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = search.trim();
    if (value.length < 2) {
      toast.error("Введите минимум два символа для поиска");
      return;
    }
    setSelectedDoctor(null);
    setSubmittedSearch(value);
  };

  return (
    <ClinicPageLayout
      title="Приглашения врачам"
      mainClassName="flex flex-col gap-5"
    >
      <div className="rounded-3xl border border-border-soft bg-white p-5 md:p-7">
        <h2 className="text-lg font-semibold text-foreground">
          Пригласить зарегистрированного врача
        </h2>
        <p className="mt-1 text-sm text-secondary">
          Врач получит уведомление и сможет принять или отклонить приглашение.
          Для врача без аккаунта используйте{" "}
          <Link
            href="/clinic-profile/invites"
            className="text-primary underline"
          >
            ссылку для регистрации
          </Link>
          .
        </p>

        <form
          onSubmit={handleSearch}
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setSelectedDoctor(null);
              setSubmittedSearch("");
            }}
            placeholder="Имя или специализация врача"
            aria-label="Поиск врача"
            className="min-w-0 flex-1 rounded-xl border border-border-soft px-4 py-3 outline-none focus:border-primary"
          />
          <Button type="submit" size="md">
            Найти врача
          </Button>
        </form>

        {submittedSearch && (
          <div className="mt-4 space-y-2">
            {doctorsQuery.isPending && (
              <p className="text-sm text-secondary">Ищем врачей…</p>
            )}
            {doctorsQuery.isError && (
              <p role="alert" className="text-sm text-red-600">
                Не удалось загрузить врачей. Попробуйте ещё раз.
              </p>
            )}
            {doctorsQuery.data?.data.length === 0 && (
              <p className="text-sm text-secondary">
                По этому запросу врачи не найдены.
              </p>
            )}
            {doctorsQuery.data?.data.map((doctor) => (
              <button
                key={doctor.id}
                type="button"
                onClick={() => {
                  setSelectedDoctor(doctor);
                  setManualDoctorId("");
                }}
                aria-pressed={selectedDoctor?.id === doctor.id}
                className={`w-full rounded-xl border p-3 text-left transition-colors ${selectedDoctor?.id === doctor.id ? "border-primary bg-primary-tint" : "border-border-soft hover:border-primary"}`}
              >
                <span className="block font-medium text-foreground">
                  {doctor.full_name}
                </span>
                <span className="text-sm text-secondary">
                  {doctor.specialty}
                </span>
              </button>
            ))}
            {doctorsQuery.data &&
              doctorsQuery.data.pagination.total_pages > 1 && (
                <p className="text-xs text-secondary">
                  Показаны первые 20 врачей. Уточните запрос, если нужного врача
                  нет в списке.
                </p>
              )}
          </div>
        )}

        <label className="mt-5 flex flex-col gap-1.5 text-sm font-medium text-secondary">
          Или укажите ID врача, если его нет в каталоге
          <input
            type="number"
            min="1"
            step="1"
            value={manualDoctorId}
            onChange={(event) => {
              setManualDoctorId(event.target.value);
              setSelectedDoctor(null);
            }}
            placeholder="ID зарегистрированного врача"
            className="rounded-xl border border-border-soft px-4 py-3 text-foreground outline-none focus:border-primary"
          />
        </label>

        {(selectedDoctor || hasManualDoctorId) && (
          <div className="mt-5 flex flex-col gap-4 border-t border-border-soft pt-5">
            <p className="font-medium text-foreground">
              Выбран: {selectedDoctor?.full_name ?? `врач #${manualDoctorId}`}
            </p>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-secondary">
              Филиал (необязательно)
              <select
                value={branchId}
                onChange={(event) => setBranchId(event.target.value)}
                className="rounded-xl border border-border-soft bg-white px-4 py-3 text-foreground outline-none focus:border-primary"
              >
                <option value="">Без филиала</option>
                {(rawProfile?.branches ?? []).map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.address}
                  </option>
                ))}
              </select>
            </label>
            <Textarea
              label="Сообщение врачу (необязательно)"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={3}
            />
            <Button
              size="md"
              className="self-start"
              loading={createMutation.isPending}
              onClick={() =>
                createMutation.mutate(
                  selectedDoctor?.id ?? Number(manualDoctorId),
                )
              }
            >
              Отправить приглашение
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-border-soft bg-white p-5 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            Отправленные приглашения
          </h2>
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
                    {invitation.doctor_name}
                  </p>
                  {invitation.doctor_specialty && (
                    <p className="text-sm text-secondary">
                      {invitation.doctor_specialty}
                    </p>
                  )}
                  {invitation.branch && (
                    <p className="mt-1 text-sm text-secondary">
                      Филиал: {invitation.branch.address}
                    </p>
                  )}
                  {invitation.message && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                      {invitation.message}
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-primary-tint px-3 py-1 text-xs text-primary">
                  {statusLabels[invitation.status]}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <time
                  className="text-xs text-secondary"
                  dateTime={invitation.created_at}
                >
                  {new Date(invitation.created_at).toLocaleDateString("ru-RU")}
                </time>
                {invitation.status === "pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={cancelMutation.isPending}
                    onClick={() => cancelMutation.mutate(invitation.id)}
                  >
                    Отменить
                  </Button>
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
    </ClinicPageLayout>
  );
}
