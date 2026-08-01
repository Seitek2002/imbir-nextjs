"use client";

import { FC, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ClinicPageLayout } from "@/widgets/clinic/layout";

import {
  ClinicProfileForm,
  type ClinicProfileFormHandle,
  useClinicCabinet,
} from "@/entities/clinic-profile";

import {
  type ClinicProfileBranch,
  clinicCabinetKeys,
  getClinicStats,
  updateClinicBranch,
} from "@/shared/api";
import { CheckIcon } from "@/shared/assets/icons";
import {
  Button,
  CancelEditButton,
  ConfirmDialog,
  Input,
  StatTiles,
} from "@/shared/ui";

import { ClinicProfileHub } from "./hub/ui";

// Плитки статистики кабинета (GET /api/clinic/stats/).
const ClinicStatsTiles: FC = () => {
  const { data: stats } = useQuery({
    queryKey: clinicCabinetKeys.stats(),
    queryFn: getClinicStats,
  });

  if (!stats) return null;

  const tiles = [
    { label: "Просмотры профиля", value: stats.profile_views },
    { label: "Записей всего", value: stats.appointments_total },
    { label: "Записей за месяц", value: stats.appointments_this_month },
    { label: "Врачей", value: stats.doctors_count },
    { label: "Пациентов", value: stats.patients_total },
    { label: "Отзывов", value: stats.reviews_count },
  ];

  return <StatTiles tiles={tiles} className="md:grid-cols-3 mb-6" />;
};

// Филиалы клиники: список с inline-правкой адреса (PUT /api/clinic/branches/{id}/).
const BranchesCard: FC<{ branches: ClinicProfileBranch[] }> = ({
  branches,
}) => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [address, setAddress] = useState("");

  const { mutate: save, isPending } = useMutation({
    mutationFn: (vars: { id: number; address: string }) =>
      updateClinicBranch(String(vars.id), { address: vars.address }),
    onSuccess: () => {
      toast.success("Филиал обновлён");
      queryClient.invalidateQueries({
        queryKey: clinicCabinetKeys.profile(),
      });
      setEditingId(null);
    },
    onError: () => toast.error("Не удалось сохранить филиал"),
  });

  if (branches.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-border p-5 lg:p-6 mb-6">
      <h3 className="text-lg font-semibold text-foreground mb-3">Филиалы</h3>
      <div className="flex flex-col gap-2">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="flex items-center gap-3 py-2 border-b border-background last:border-0"
          >
            {editingId === branch.id ? (
              <>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="flex-1"
                  placeholder="Адрес филиала"
                />
                <Button
                  size="sm"
                  disabled={!address.trim() || isPending}
                  onClick={() =>
                    save({ id: branch.id, address: address.trim() })
                  }
                >
                  {isPending ? "..." : "Сохранить"}
                </Button>
                <CancelEditButton onClick={() => setEditingId(null)} />
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-foreground truncate">
                  {branch.address || "Адрес не указан"}
                </span>
                <Button
                  variant="text"
                  className="text-primary"
                  onClick={() => {
                    setEditingId(branch.id);
                    setAddress(branch.address ?? "");
                  }}
                >
                  Изменить
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const PencilIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.3334 2.00001C11.5085 1.82491 11.7163 1.68602 11.9451 1.59126C12.1739 1.4965 12.4191 1.44769 12.6667 1.44769C12.9143 1.44769 13.1595 1.4965 13.3883 1.59126C13.6171 1.68602 13.8249 1.82491 14.0001 2.00001C14.1752 2.17511 14.3141 2.38291 14.4088 2.61172C14.5036 2.84052 14.5524 3.08571 14.5524 3.33334C14.5524 3.58097 14.5036 3.82617 14.4088 4.05497C14.3141 4.28377 14.1752 4.49158 14.0001 4.66668L5.00008 13.6667L1.33341 14.6667L2.33341 11L11.3334 2.00001Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ClinicProfilePage: FC = () => {
  const { profile, isLoading, isSaving, saveProfile, rawProfile } =
    useClinicCabinet();
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const formRef = useRef<ClinicProfileFormHandle>(null);

  const handleSave = async () => {
    // Берём реально введённые значения из формы (включая логотип-файл)
    const payload = formRef.current?.getPayload();
    if (payload) await saveProfile(payload);
    setIsEditing(false);
  };
  const handleEdit = () => setIsEditing(true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted">
        Загрузка...
      </div>
    );
  }

  return (
    <ClinicPageLayout title="Моя клиника" desktopTitle="Мой профиль">
      {/* Десктоп: единая страница со всеми секциями и одним общим
          «Редактировать» (без изменений). Мобайл: хаб-список секций ниже —
          редактирование происходит на отдельном экране каждой секции. */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[32px] font-semibold text-foreground">
            Моя клиника
          </h2>
          {isEditing ? (
            <div className="flex items-center gap-3">
              <CancelEditButton onClick={() => setIsEditing(false)} />
              <Button
                onClick={() => setShowSaveConfirm(true)}
                disabled={isSaving}
              >
                {isSaving ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              IconLeft={PencilIcon}
              onClick={handleEdit}
            >
              Редактировать
            </Button>
          )}
        </div>

        {!isEditing && <ClinicStatsTiles />}
        {!isEditing && <BranchesCard branches={rawProfile?.branches ?? []} />}

        {profile && (
          <ClinicProfileForm ref={formRef} {...profile} isEditing={isEditing} />
        )}
      </div>

      <div className="md:hidden">
        <ClinicProfileHub />
      </div>

      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleSave}
        icon={<CheckIcon className="w-7 h-7 text-primary" />}
        title="Сохранить изменения?"
        description="Обновлённые данные профиля клиники будут сохранены"
        confirmLabel="Сохранить"
        cancelLabel="Отмена"
      />
    </ClinicPageLayout>
  );
};
