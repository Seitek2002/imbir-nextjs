"use client";

import { FC, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ClinicPageLayout } from "@/widgets/clinic/layout";

import { NotificationSoundSettings } from "@/features/notification-sounds";

import {
  ClinicProfileForm,
  type ClinicProfileFormHandle,
  useClinicCabinet,
} from "@/entities/clinic-profile";
import {
  resolveSpecializationIds,
  useSpecializationOptions,
  useSpecializations,
} from "@/entities/specialization";

import {
  type ClinicProfileBranch,
  branchLabel,
  clinicCabinetKeys,
  createClinicBranch,
  deleteClinicBranch,
  getClinicStats,
  getConditions,
  getEquipment,
  referenceKeys,
  updateClinicBranch,
} from "@/shared/api";
import { CheckIcon } from "@/shared/assets/icons";
import { extractErrorMessage } from "@/shared/lib/errors";
import {
  AnimatedNumber,
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
  ].map(({ label, value }) => ({
    label,
    value: <AnimatedNumber value={value} />,
  }));

  return <StatTiles tiles={tiles} className="md:grid-cols-3 mb-6" />;
};

type BranchDraft = { address: string; name: string; phone: string };

const EMPTY_BRANCH_DRAFT: BranchDraft = { name: "", address: "", phone: "" };

// Форма филиала — одна и для нового, и для правки существующего.
const BranchForm: FC<{
  draft: BranchDraft;
  isPending: boolean;
  onCancel: () => void;
  onChange: (draft: BranchDraft) => void;
  onSave: () => void;
}> = ({ draft, isPending, onCancel, onChange, onSave }) => (
  <div className="flex flex-col gap-3 py-3 border-b border-background last:border-0">
    <Input
      label="Название"
      value={draft.name}
      onChange={(e) => onChange({ ...draft, name: e.target.value })}
      placeholder="Например, филиал на Чуй"
    />
    <Input
      label="Адрес"
      value={draft.address}
      onChange={(e) => onChange({ ...draft, address: e.target.value })}
      placeholder="Адрес филиала"
    />
    <Input
      label="Телефон"
      type="tel"
      value={draft.phone}
      onChange={(e) => onChange({ ...draft, phone: e.target.value })}
      placeholder="+996 ..."
    />
    <div className="flex items-center gap-3">
      <Button
        size="sm"
        disabled={!draft.address.trim() || isPending}
        onClick={onSave}
      >
        {isPending ? "Сохранение..." : "Сохранить"}
      </Button>
      <CancelEditButton onClick={onCancel} />
    </div>
  </div>
);

// Филиалы клиники: добавление (POST /api/clinic/branches/), правка названия,
// адреса и телефона (PUT /api/clinic/branches/{id}/) и удаление. Раньше
// можно было только поменять адрес уже заведённого через админку филиала, а
// при нуле филиалов карточка не показывалась вовсе — завести первый было
// негде, и выбор филиала в процедурах и приглашениях оставался пустым.
const BranchesCard: FC<{ branches: ClinicProfileBranch[] }> = ({
  branches,
}) => {
  const queryClient = useQueryClient();
  // "new" — форма добавления, число — правка этого филиала.
  const [editingId, setEditingId] = useState<"new" | null | number>(null);
  const [draft, setDraft] = useState<BranchDraft>(EMPTY_BRANCH_DRAFT);
  const [deleteTarget, setDeleteTarget] = useState<ClinicProfileBranch | null>(
    null,
  );

  const refreshProfile = () =>
    queryClient.invalidateQueries({ queryKey: clinicCabinetKeys.profile() });

  const { mutate: save, isPending } = useMutation({
    mutationFn: async () => {
      const body = {
        name: draft.name.trim(),
        address: draft.address.trim(),
        phone: draft.phone.trim(),
      };
      if (editingId === "new") await createClinicBranch(body);
      else if (editingId !== null)
        await updateClinicBranch(String(editingId), body);
    },
    onSuccess: () => {
      toast.success(
        editingId === "new" ? "Филиал добавлен" : "Филиал обновлён",
      );
      refreshProfile();
      setEditingId(null);
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      toast.error(extractErrorMessage(data, "Не удалось сохранить филиал"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteClinicBranch(id),
    onSuccess: () => {
      toast.success("Филиал удалён");
      refreshProfile();
      setDeleteTarget(null);
    },
    onError: () => toast.error("Не удалось удалить филиал"),
  });

  const startEdit = (id: "new" | number, next: BranchDraft) => {
    setEditingId(id);
    setDraft(next);
  };

  const form = (
    <BranchForm
      draft={draft}
      isPending={isPending}
      onChange={setDraft}
      onSave={() => save()}
      onCancel={() => setEditingId(null)}
    />
  );

  return (
    <div className="bg-white rounded-3xl border border-border p-5 lg:p-6 mb-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-lg font-semibold text-foreground">Филиалы</h3>
        {editingId === null && (
          <Button
            variant="text"
            className="text-primary"
            onClick={() => startEdit("new", EMPTY_BRANCH_DRAFT)}
          >
            + Добавить филиал
          </Button>
        )}
      </div>
      {branches.length === 0 && editingId !== "new" && (
        <p className="text-sm text-muted">
          Филиалов пока нет. Добавьте адреса, где клиника принимает пациентов —
          их можно будет указать в процедурах и приглашениях врачам.
        </p>
      )}
      <div className="flex flex-col gap-2">
        {branches.map((branch) =>
          editingId === branch.id ? (
            <div key={branch.id}>{form}</div>
          ) : (
            <div
              key={branch.id}
              className="flex items-center gap-3 py-2 border-b border-background last:border-0"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {branchLabel(branch)}
                </div>
                {!!branch.name?.trim() && (
                  <div className="text-xs text-muted truncate">
                    {branch.address || "Адрес не указан"}
                  </div>
                )}
                {!!branch.phone && (
                  <div className="text-xs text-muted truncate">
                    {branch.phone}
                  </div>
                )}
              </div>
              <Button
                variant="text"
                className="text-primary"
                disabled={editingId !== null}
                onClick={() =>
                  startEdit(branch.id, {
                    name: branch.name ?? "",
                    address: branch.address ?? "",
                    phone: branch.phone ?? "",
                  })
                }
              >
                Изменить
              </Button>
              <Button
                variant="text"
                className="text-muted"
                disabled={editingId !== null}
                onClick={() => setDeleteTarget(branch)}
              >
                Удалить
              </Button>
            </div>
          ),
        )}
        {editingId === "new" && form}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
        closeOnConfirm={false}
        variant="danger"
        title="Удалить филиал?"
        description={
          deleteTarget
            ? `«${branchLabel(deleteTarget)}» исчезнет из профиля. Врачи, процедуры и ссылки-приглашения останутся, но без привязки к филиалу.`
            : undefined
        }
        confirmLabel="Удалить"
        cancelLabel="Отмена"
      />
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
  const {
    profile,
    isLoading,
    isSaving,
    saveProfile,
    rawProfile,
    uploadPhoto,
    deletePhoto,
    photoItems,
    uploadDocument,
    deleteDocument,
    isUploadingPhoto,
    isUploadingDocument,
  } = useClinicCabinet();
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const formRef = useRef<ClinicProfileFormHandle>(null);

  // Форма отдаёт названия специализаций; бэк на запись принимает только id
  // справочника — резолвим здесь же, перед отправкой
  // (см. ClinicProfileFormHandle.getSpecializationNames).
  const { data: specializationList = [] } = useSpecializations("reference");
  // Тот же справочник, но готовыми options — форме он нужен для выпадающих
  // списков направлений. Запрос общий, так что второго похода на сервер нет.
  const {
    options: specializationOptions,
    isLoading: isSpecializationsLoading,
  } = useSpecializationOptions("reference");
  const { data: equipmentValues = [], isLoading: isEquipmentLoading } =
    useQuery({
      queryKey: referenceKeys.equipment(),
      queryFn: getEquipment,
      staleTime: 60 * 60 * 1000,
    });
  const { data: patientConditionValues = [], isLoading: isConditionsLoading } =
    useQuery({
      queryKey: referenceKeys.conditions(),
      queryFn: getConditions,
      staleTime: 60 * 60 * 1000,
    });
  const equipmentOptions = equipmentValues.map((value) => ({
    label: value,
    value,
  }));
  const patientConditionOptions = patientConditionValues.map((value) => ({
    label: value,
    value,
  }));

  const handleSave = async () => {
    // Берём реально введённые значения из формы (включая логотип-файл)
    const payload = formRef.current?.getPayload();
    const names = formRef.current?.getSpecializationNames();
    if (!payload) {
      setIsEditing(false);
      setShowSaveConfirm(false);
      return;
    }

    const primary = resolveSpecializationIds(
      names?.primary ?? [],
      specializationList,
    );
    const narrow = resolveSpecializationIds(
      names?.narrow ?? [],
      specializationList,
    );
    const unmatched = [...primary.unmatched, ...narrow.unmatched];
    if (unmatched.length > 0) {
      toast.error(
        `Не найдено в справочнике и не сохранено: ${unmatched.join(", ")}`,
      );
    }

    try {
      await saveProfile({
        ...payload,
        primary_specialization_ids: primary.ids,
        narrow_specialization_ids: narrow.ids,
      });
      setIsEditing(false);
      setShowSaveConfirm(false);
    } catch {
      // Ошибка уже показана тостом в onError мутации (useClinicCabinet) —
      // оставляем диалог открытым, чтобы можно было повторить попытку.
    }
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
                size="sm"
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
          <ClinicProfileForm
            ref={formRef}
            {...profile}
            isEditing={isEditing}
            onUploadPhoto={uploadPhoto}
            onUploadDocument={uploadDocument}
            // Удаление на десктопе — те же мутации, что в мобильных разделах
            // «Основная информация» и «Юридическая информация»
            onDeletePhoto={deletePhoto}
            onDeleteDocument={deleteDocument}
            photoItems={photoItems}
            isUploadingPhoto={isUploadingPhoto}
            isUploadingDocument={isUploadingDocument}
            specializationOptions={specializationOptions}
            isSpecializationsLoading={isSpecializationsLoading}
            equipmentOptions={equipmentOptions}
            patientConditionOptions={patientConditionOptions}
            isReferenceDataLoading={isEquipmentLoading || isConditionsLoading}
          />
        )}
      </div>

      <div className="md:hidden">
        <ClinicProfileHub />
        {/* В хабе раздела под филиалы нет — карточка та же, что на десктопе. */}
        <div className="mt-6 px-4">
          <BranchesCard branches={rawProfile?.branches ?? []} />
        </div>
      </div>

      <div className="mt-8 px-4 md:px-0">
        <NotificationSoundSettings kinds={["appointment", "chat"]} />
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
        isLoading={isSaving}
        closeOnConfirm={false}
      />
    </ClinicPageLayout>
  );
};
