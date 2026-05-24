"use client";

import { FC, useState } from "react";

import { Button } from "@/shared";

import { ClinicSidebar } from "@/widgets/clinic-sidebar";

import { MOCK_CLINICS } from "@/shared/api/mock-data";
import { GeoIcon, HistoryIcon } from "@/shared/assets";
import { cn } from "@/shared/lib/utils";

const MOCK_CLINIC_ID = "1";
const clinic = MOCK_CLINICS.find((c) => c.id === MOCK_CLINIC_ID)!;

type InviteLink = {
  id: string;
  clinicId: string;
  branchId: string | null;
  branchLabel: string;
  createdAt: string;
  expiresAt: string;
  active: boolean;
};

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

const branchOptions = [
  { id: null, label: "Главный офис", address: clinic.address },
  ...(clinic.branches ?? []).map((b) => ({
    id: b.id,
    label: `Филиал — ${b.address}`,
    address: b.address,
  })),
];

function makeExpiryDate() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toLocaleDateString("ru-RU");
}

export const ClinicInvitesPage: FC = () => {
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [links, setLinks] = useState<InviteLink[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedBranch =
    branchOptions.find((b) => b.id === selectedBranchId) ?? branchOptions[0];

  const handleCreate = () => {
    const newLink: InviteLink = {
      id: crypto.randomUUID(),
      clinicId: clinic.id,
      branchId: selectedBranch.id,
      branchLabel: selectedBranch.label,
      createdAt: new Date().toLocaleDateString("ru-RU"),
      expiresAt: makeExpiryDate(),
      active: true,
    };
    setLinks((prev) => [newLink, ...prev]);
  };

  const handleCopy = (link: InviteLink) => {
    const params = new URLSearchParams({ clinicId: link.clinicId });
    if (link.branchId) params.set("branchId", link.branchId);
    const url = `${window.location.origin}/register?${params.toString()}`;
    navigator.clipboard.writeText(url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeactivate = (id: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, active: false } : l)),
    );
  };

  return (
    <div className="w-full min-h-screen">
      <div className="md:hidden flex items-center px-4 py-4 bg-white border-b border-[#E5E6E8]">
        <h1 className="text-lg font-semibold text-[#191A1B]">
          Пригласить врача
        </h1>
      </div>

      <div className="max-w-360 mx-auto px-4 md:px-10 py-4 md:py-8">
        <h1 className="text-[40px] font-semibold text-[#191A1B] mb-2 hidden md:block">
          Пригласить врача
        </h1>

        <div className="flex gap-6">
          <ClinicSidebar clinicName={clinic.name} rating={clinic.rating} />

          <main className="flex-1 min-w-0 flex flex-col gap-6">
            {/* Info banner */}
            <div className="bg-[#FFF8F5] border border-[#FDDDD5] rounded-2xl p-4 flex gap-3">
              <div className="size-9 rounded-xl bg-[#F5653E] flex items-center justify-center shrink-0 mt-0.5">
                <LinkIcon />
              </div>
              <div>
                <p className="font-semibold text-[#191A1B] text-sm mb-1">
                  Как это работает
                </p>
                <p className="text-sm text-[#686F72]">
                  Создайте ссылку-приглашение для врача. Перейдя по ней, врач
                  попадёт на регистрацию с уже предзаполненными данными вашей
                  клиники и филиала. Ссылка действует 7 дней.
                </p>
              </div>
            </div>

            {/* Generator */}
            <div className="bg-white border border-[#E5E6E8] rounded-2xl p-5 flex flex-col gap-4">
              <h2 className="font-semibold text-[#191A1B] text-lg">
                Создать ссылку
              </h2>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-[#0D0D12]">
                  Филиал
                </span>
                <div className="flex flex-col gap-2">
                  {branchOptions.map((opt) => (
                    <button
                      key={opt.id ?? "main"}
                      type="button"
                      onClick={() => setSelectedBranchId(opt.id)}
                      className={cn(
                        "w-full rounded-xl border-2 p-3 text-left flex items-start gap-3 transition-colors",
                        selectedBranchId === opt.id
                          ? "border-[#F5653E] bg-[#FFF8F5]"
                          : "border-[#E5E6E8] hover:border-[#F5653E]/40",
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 size-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                          selectedBranchId === opt.id
                            ? "border-[#F5653E]"
                            : "border-[#C4C8CA]",
                        )}
                      >
                        {selectedBranchId === opt.id && (
                          <div className="size-2 rounded-full bg-[#F5653E]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#191A1B]">
                          {opt.id === null ? clinic.name : `Филиал`}
                        </p>
                        <p className="text-xs text-[#686F72] flex items-center gap-1 mt-0.5">
                          <GeoIcon className="size-3 text-[#F5653E] shrink-0" />
                          {opt.address}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button className="w-full justify-center" onClick={handleCreate}>
                Создать ссылку
              </Button>
            </div>

            {/* Links list */}
            {links.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="font-semibold text-[#191A1B] text-lg">
                  Созданные ссылки
                </h2>
                {links.map((link) => (
                  <div
                    key={link.id}
                    className={cn(
                      "bg-white border rounded-2xl p-4 flex flex-col gap-3",
                      link.active
                        ? "border-[#E5E6E8]"
                        : "border-[#E5E6E8] opacity-50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#191A1B] truncate">
                          {link.branchLabel}
                        </p>
                        <p className="text-xs text-[#838A8D] mt-0.5 font-mono truncate">
                          /register?clinicId={link.clinicId}
                          {link.branchId && `&branchId=${link.branchId}`}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 text-xs px-2 py-0.5 rounded-full font-medium",
                          link.active
                            ? "bg-green-100 text-green-700"
                            : "bg-[#F2F3F5] text-[#838A8D]",
                        )}
                      >
                        {link.active ? "Активна" : "Деактивирована"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#838A8D]">
                      <span className="flex items-center gap-1">
                        <HistoryIcon className="size-3.5 text-[#F5653E]" />
                        Создана: {link.createdAt}
                      </span>
                      <span className="flex items-center gap-1">
                        <HistoryIcon className="size-3.5 text-[#838A8D]" />
                        До: {link.expiresAt}
                      </span>
                    </div>

                    {link.active && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 justify-center gap-2"
                          onClick={() => handleCopy(link)}
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
                          onClick={() => handleDeactivate(link.id)}
                          className="size-9 rounded-xl border border-[#E5E6E8] flex items-center justify-center text-[#838A8D] hover:border-red-300 hover:text-red-500 transition-colors"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
