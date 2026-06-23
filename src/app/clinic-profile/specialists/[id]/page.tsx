"use client";

import { useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { ConfirmDialog } from "@/shared";

import { ClinicSidebar } from "@/widgets/clinic-sidebar";

import { useClinicCabinet } from "@/entities/clinic-profile";
import {
  EMPTY_SPECIALIST_FORM,
  type SpecialistFormData,
  useSpecialistsStore,
} from "@/entities/clinic-specialist";

import { BasicInfo, Certificates, Education, ProfessionalInfo } from "./ui";

const TrashIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#F5653E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

export default function SpecialistDetailsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { profile } = useClinicCabinet();
  const { update, remove } = useSpecialistsStore();

  const [isEditing, setIsEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [initialState] = useState(() => {
    const s = useSpecialistsStore
      .getState()
      .specialists.find((x) => x.id === id);
    return {
      notFound: !s,
      d: s
        ? { ...s, certificates: undefined, id: undefined }
        : { ...EMPTY_SPECIALIST_FORM },
      certs: s ? [...s.certificates] : [],
    };
  });

  const [d, setD] = useState<SpecialistFormData>(initialState.d);

  const [notFound] = useState(initialState.notFound);

  const [certs, setCerts] = useState<string[]>(initialState.certs);

  const set = <K extends keyof SpecialistFormData>(
    field: K,
    value: SpecialistFormData[K],
  ) => setD((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    update(id, { ...d, certificates: certs });
    setIsEditing(false);
  };

  const handleDelete = () => {
    remove(id);
    router.push("/clinic-profile/specialists");
  };

  if (notFound) {
    return (
      <div className="w-full max-w-360 mx-auto px-4 md:px-10 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="#191A1B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="bg-white rounded-3xl border border-border p-16 text-center">
          <p className="text-muted text-lg">Специалист не найден</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface transition-colors shrink-0"
              aria-label="Назад"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="#191A1B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <h2 className="text-[28px] font-semibold text-foreground flex-1 truncate">
              {isEditing ? "Редактировать" : d.fullName}
            </h2>

            {isEditing ? (
              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-colors shrink-0"
              >
                Сохранить
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 rounded-full border border-border text-secondary font-medium hover:bg-surface transition-colors flex items-center gap-2 shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M11.333 2a1.886 1.886 0 012.667 2.667L5.001 13.667 1.334 14.667l1-3.667L11.333 2z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Редактировать
              </button>
            )}

            {!isEditing && (
              <button
                onClick={() => setConfirmOpen(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-tint transition-colors shrink-0"
                aria-label="Удалить"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M2.5 5H4.167M4.167 5H17.5M4.167 5V16.667A1.667 1.667 0 005.833 18.333h8.334A1.667 1.667 0 0015.833 16.667V5H4.167zM6.667 5V3.333A1.667 1.667 0 018.333 1.667h3.334A1.667 1.667 0 0113.333 3.333V5"
                    stroke="#F5653E"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-border divide-y divide-border">
            <BasicInfo isEditing={isEditing} d={d} set={set} />

            <ProfessionalInfo isEditing={isEditing} d={d} set={set} />

            <Education isEditing={isEditing} d={d} set={set} />

            <Certificates
              isEditing={isEditing}
              d={d}
              set={set}
              setCerts={setCerts}
              certs={certs}
            />
          </div>
        </main>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        icon={<TrashIcon />}
        title="Удалить специалиста?"
        description="Специалист будет удалён без возможности восстановления"
        confirmLabel="Удалить"
        cancelLabel="Отмена"
      />
    </div>
  );
}
