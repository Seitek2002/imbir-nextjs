"use client";

import { FC, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ClinicPageLayout } from "@/widgets/clinic/layout";

import { useClinicCabinet } from "@/entities/clinic-profile";

import {
  clinicCabinetKeys,
  createClinicInvite,
  deleteClinicInvite,
  getClinicInvites,
} from "@/shared/api";
import { GeoIcon, HistoryIcon, WarningIcon } from "@/shared/assets/icons";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/shared/store";
import { Button } from "@/shared/ui";

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M6.667 8.667a3.333 3.333 0 005.04.36l2-2a3.333 3.333 0 00-4.714-4.714L7.96 3.347"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.333 7.333a3.333 3.333 0 00-5.04-.36l-2 2a3.333 3.333 0 004.714 4.714l1.027-1.027"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect
      x="5.333"
      y="5.333"
      width="9.334"
      height="9.334"
      rx="1.333"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.333 10.667H2.667A1.333 1.333 0 011.333 9.334V2.667A1.333 1.333 0 012.667 1.334h6.666a1.333 1.333 0 011.334 1.333v.666"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M2 4h12M5.333 4V2.667a.667.667 0 01.667-.667h4a.667.667 0 01.667.667V4M6.667 7.333v4M9.333 7.333v4M3.333 4l.667 9.333A1.333 1.333 0 005.333 14.667h5.334a1.333 1.333 0 001.333-1.334L12.667 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M13.333 4L6 11.333 2.667 8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ClinicInvitesPage: FC = () => {
  const { profile, rawProfile } = useClinicCabinet();
  const authUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const branchOptions = [
    { id: null, label: "Главный офис", address: profile?.fullAddress ?? "" },
    ...(rawProfile?.branches ?? []).map((b) => ({
      id: b.id,
      label: `Филиал — ${b.address}`,
      address: b.address,
    })),
  ];

  // /api/clinic/profile/ не отдаёт id клиники, но invite_clinic_id на бэке —
  // это тот же id, что и id залогиненного пользователя (см. подтверждение через
  // POST /api/auth/register/doctor/ с invite_clinic_id = user.id).
  const clinicId = authUser?.id ? String(authUser.id) : "";
  const hasClinicId = clinicId !== "";
  const selectedBranch =
    branchOptions.find((b) => b.id === selectedBranchId) ?? branchOptions[0];

  const { data: invitesData } = useQuery({
    queryKey: clinicCabinetKeys.invites(),
    queryFn: getClinicInvites,
  });

  const links = invitesData ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      createClinicInvite(
        selectedBranch.id != null ? { branch: Number(selectedBranch.id) } : {},
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicCabinetKeys.invites() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteClinicInvite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicCabinetKeys.invites() });
    },
  });

  const handleCopy = (linkId: string, branchId: number | null) => {
    const params = new URLSearchParams({ clinicId: String(clinicId) });
    if (branchId != null) params.set("branchId", String(branchId));
    const url = `${window.location.origin}/register?${params.toString()}`;
    navigator.clipboard.writeText(url);
    setCopiedId(linkId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getBranchLabel = (branchId: number | null) => {
    if (branchId == null) return profile?.name ?? "Главный офис";
    const opt = branchOptions.find((b) => b.id === branchId);
    return opt ? `Филиал — ${opt.address}` : `Филиал #${branchId}`;
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("ru-RU");

  return (
    <ClinicPageLayout
      title="Пригласить врача"
      mainClassName="flex flex-col gap-6"
    >
      {/* Info banner */}
      <div className="bg-primary-tint border border-[#FDDDD5] rounded-2xl p-4 flex gap-3">
        <div className="size-9 rounded-xl bg-primary flex items-center justify-center shrink-0 mt-0.5">
          <LinkIcon />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm mb-1">
            Как это работает
          </p>
          <p className="text-sm text-secondary">
            Создайте ссылку-приглашение для врача. Перейдя по ней, врач попадёт
            на регистрацию с уже предзаполненными данными вашей клиники и
            филиала. Ссылка действует 7 дней.
          </p>
        </div>
      </div>

      {!hasClinicId && (
        <div className="bg-[#FFF8E6] border border-[#F5D889] rounded-2xl p-4 flex gap-3">
          <div className="size-9 rounded-xl bg-[#F5D889] flex items-center justify-center shrink-0 mt-0.5">
            <WarningIcon className="text-foreground" />
          </div>
          <p className="text-sm text-secondary">
            Не удалось определить ID вашей клиники — ссылка-приглашение будет
            недоступна для копирования. Попробуйте обновить страницу или
            обратитесь в поддержку.
          </p>
        </div>
      )}

      {/* Generator */}
      <div className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-4">
        <h2 className="font-semibold text-foreground text-lg">
          Создать ссылку
        </h2>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-overlay">Филиал</span>
          <div className="flex flex-col gap-2">
            {branchOptions.map((opt) => (
              <button
                key={opt.id ?? "main"}
                type="button"
                onClick={() => setSelectedBranchId(opt.id + "")}
                className={cn(
                  "w-full rounded-xl border-2 p-3 text-left flex items-start gap-3 transition-colors",
                  selectedBranchId === opt.id
                    ? "border-primary bg-primary-tint"
                    : "border-border hover:border-primary/40",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 size-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                    selectedBranchId === opt.id
                      ? "border-primary"
                      : "border-dim",
                  )}
                >
                  {selectedBranchId === opt.id && (
                    <div className="size-2 rounded-full bg-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {opt.id === null
                      ? (profile?.name ?? "Главный офис")
                      : `Филиал`}
                  </p>
                  <p className="text-xs text-secondary flex items-center gap-1 mt-0.5">
                    <GeoIcon className="size-3 text-primary shrink-0" />
                    {opt.address}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <Button
          className="w-full justify-center"
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Создание..." : "Создать ссылку"}
        </Button>
      </div>

      {/* Links list */}
      {links.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-semibold text-foreground text-lg">
            Созданные ссылки
          </h2>
          {links.map((link) => (
            <div
              key={link.id}
              className={cn(
                "bg-white border rounded-2xl p-4 flex flex-col gap-3",
                link.is_active ? "border-border" : "border-border opacity-50",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {getBranchLabel(link.branch)}
                  </p>
                  <p className="text-xs text-muted mt-0.5 font-mono truncate">
                    {hasClinicId
                      ? `/register?clinicId=${clinicId}${link.branch != null ? `&branchId=${link.branch}` : ""}`
                      : "ID клиники недоступен"}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-xs px-2 py-0.5 rounded-full font-medium",
                    link.is_valid
                      ? "bg-green-100 text-green-700"
                      : "bg-background text-muted",
                  )}
                >
                  {link.is_valid ? "Активна" : "Истекла"}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1">
                  <HistoryIcon className="size-3.5 text-primary" />
                  Создана: {formatDate(link.created_at)}
                </span>
                {link.expires_at && (
                  <span className="flex items-center gap-1">
                    <HistoryIcon className="size-3.5 text-muted" />
                    До: {formatDate(link.expires_at)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 justify-center gap-2"
                  onClick={() => handleCopy(link.id, link.branch)}
                  disabled={!hasClinicId}
                >
                  {copiedId === link.id ? (
                    <>
                      <CheckIcon />
                      Скопировано
                    </>
                  ) : (
                    <>
                      <CopyIcon />
                      Копировать ссылку
                    </>
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(link.id)}
                  disabled={deleteMutation.isPending}
                  className="size-9 rounded-xl border border-border flex items-center justify-center text-muted hover:border-red-300 hover:text-red-500 transition-colors"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ClinicPageLayout>
  );
};
