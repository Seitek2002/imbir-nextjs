"use client";

import { FC, useState } from "react";

import { DoctorMyDataTabs, DoctorPageLayout } from "@/widgets/doctor/layout";
import { useDoctorCabinet } from "@/widgets/doctor/layout";
import { FieldView } from "@/widgets/doctor/layout";

import { CheckIcon } from "@/shared/assets/icons";
import { Button, ConfirmDialog, IconBtn, Input } from "@/shared/ui";

const PlusIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <path
      d="M7 2V12M2 7H12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const CloseIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M12 4L4 12M4 4L12 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

type D = {
  university: string;
  graduationYear: string;
  internship: string;
  residency: string;
  diplomaSpecialty: string;
  additionalEducation: string[];
};

export const DoctorEducationPage: FC = () => {
  const { profile, isLoading, isSaving, saveProfile, rawProfile } =
    useDoctorCabinet();
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [d, setD] = useState<D>({
    university: "",
    graduationYear: "",
    internship: "",
    residency: "",
    diplomaSpecialty: "",
    additionalEducation: [],
  });

  // Синхронизация с профилем прямо в рендере («adjust state during render»).
  const [syncedProfile, setSyncedProfile] = useState(profile);
  if (profile && profile !== syncedProfile) {
    setSyncedProfile(profile);
    setD({
      university: profile.university,
      graduationYear: profile.graduationYear,
      internship: profile.internship,
      residency: profile.residency,
      diplomaSpecialty: profile.diplomaSpecialty,
      additionalEducation: [...profile.additionalEducation],
    });
  }

  const set = <K extends keyof D>(k: K, v: D[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    const mainEdu = d.university
      ? [
          {
            institution: d.university,
            degree: d.diplomaSpecialty,
            year: parseInt(d.graduationYear) || new Date().getFullYear(),
          },
        ]
      : [];
    const addEdu = d.additionalEducation
      .filter(Boolean)
      .map((e) => ({ institution: e, degree: "", year: 0 }));
    await saveProfile({
      education: [...mainEdu, ...addEdu],
    });
    setIsEditing(false);
  };

  const title = isEditing ? "Редактировать" : "Образование";

  if (isLoading) {
    return (
      <DoctorPageLayout title="Образование">
        <div className="flex items-center justify-center py-20 text-muted">
          Загрузка...
        </div>
      </DoctorPageLayout>
    );
  }

  // suppress unused var warning — rawProfile used for future extension
  void rawProfile;

  return (
    <DoctorPageLayout
      title={title}
      editAction={isEditing ? "save" : "edit"}
      onEditToggle={
        isEditing ? () => setShowSaveConfirm(true) : () => setIsEditing(true)
      }
    >
      <div className="hidden lg:flex items-center justify-between mb-6">
        <h2 className="text-[28px] font-semibold text-foreground">{title}</h2>
        <Button
          variant={isEditing ? "default" : "outline"}
          size="sm"
          onClick={
            isEditing
              ? () => setShowSaveConfirm(true)
              : () => setIsEditing(true)
          }
          disabled={isSaving}
        >
          {isSaving
            ? "Сохранение..."
            : isEditing
              ? "Сохранить"
              : "Редактировать"}
        </Button>
      </div>

      <DoctorMyDataTabs />

      <div className="bg-white rounded-3xl border border-border p-5 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            {isEditing ? (
              <Input
                label="ВУЗ"
                value={d.university}
                onChange={(e) => set("university", e.target.value)}
                placeholder="Название учебного заведения"
              />
            ) : (
              <FieldView label="ВУЗ" value={d.university} />
            )}
          </div>
          <div>
            {isEditing ? (
              <Input
                label="Год окончания"
                value={d.graduationYear}
                onChange={(e) => set("graduationYear", e.target.value)}
                placeholder="ГГГГ"
              />
            ) : (
              <FieldView label="Год окончания" value={d.graduationYear} />
            )}
          </div>
          <div>
            {isEditing ? (
              <Input
                label="Интернатура"
                value={d.internship}
                onChange={(e) => set("internship", e.target.value)}
                placeholder="Специальность"
              />
            ) : (
              <FieldView label="Интернатура" value={d.internship} />
            )}
          </div>
          <div>
            {isEditing ? (
              <Input
                label="Ординатура"
                value={d.residency}
                onChange={(e) => set("residency", e.target.value)}
                placeholder="Специальность"
              />
            ) : (
              <FieldView label="Ординатура" value={d.residency} />
            )}
          </div>
          <div className="lg:col-span-2">
            {isEditing ? (
              <Input
                label="Специализация по диплому"
                value={d.diplomaSpecialty}
                onChange={(e) => set("diplomaSpecialty", e.target.value)}
                placeholder="Введите специализацию"
              />
            ) : (
              <FieldView
                label="Специализация по диплому"
                value={d.diplomaSpecialty}
              />
            )}
          </div>
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted text-sm">Дополнительное образование</p>
              {isEditing && (
                <Button
                  variant="text"
                  size="xs"
                  className="text-primary"
                  IconLeft={PlusIcon}
                  onClick={() =>
                    set("additionalEducation", [...d.additionalEducation, ""])
                  }
                >
                  Добавить
                </Button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-2">
                {d.additionalEducation.length === 0 && (
                  <div className="text-dim text-sm px-4 py-3 rounded-2xl border border-dashed border-border text-center">
                    Нажмите «Добавить»
                  </div>
                )}
                {d.additionalEducation.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) =>
                        set(
                          "additionalEducation",
                          d.additionalEducation.map((v, j) =>
                            j === i ? e.target.value : v,
                          ),
                        )
                      }
                      placeholder="Курс, год"
                      className="flex-1"
                    />
                    <IconBtn
                      onClick={() =>
                        set(
                          "additionalEducation",
                          d.additionalEducation.filter((_, j) => j !== i),
                        )
                      }
                      variant="text"
                      size="xs"
                      className="text-dim hover:text-primary"
                    >
                      <CloseIcon />
                    </IconBtn>
                  </div>
                ))}
              </div>
            ) : (
              <FieldView label="" value={d.additionalEducation} />
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleSave}
        icon={<CheckIcon className="w-7 h-7 text-primary" />}
        title="Сохранить изменения?"
        description="Обновлённые данные профиля будут сохранены"
        confirmLabel="Сохранить"
        cancelLabel="Отмена"
      />
    </DoctorPageLayout>
  );
};
