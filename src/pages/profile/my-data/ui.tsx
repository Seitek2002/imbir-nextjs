"use client";

import { FC, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { MobilePageHeader } from "@/widgets/profile/mobile-header";

import { getProfile, profileKeys, updateProfile } from "@/shared/api";
import { CheckIcon, EditIcon } from "@/shared/assets/icons";
import { useAuthStore } from "@/shared/store";
import {
  Button,
  CancelEditButton,
  ConfirmDialog,
  IconBtn,
  ImageWithFallback,
  Input,
  PhoneInput,
} from "@/shared/ui";

type D = {
  email: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  phone: string;
  photo?: string;
};

const Field: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="py-3 border-b border-background last:border-0">
    <p className="text-muted text-xs mb-1">{label}</p>
    <p className="text-foreground text-base">{value || "—"}</p>
  </div>
);

export const ProfileMyDataPage: FC = () => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const initialData: D = {
    firstName: user?.first_name ?? "",
    lastName: user?.last_name ?? "",
    patronymic: "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
    photo: user?.avatar ?? undefined,
  };
  const [d, setD] = useState<D>(initialData);
  const savedDataRef = useRef<D>(initialData);
  const photoRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof D>(k: K, v: D[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  // Профиль тянем через React Query, а не одноразовым эффектом: ответ ложится
  // в кеш, и при возврате на страницу поля показываются сразу, без повторного
  // запроса. В authStore отчества нет вообще, поэтому до ответа сервера его
  // взять негде — на это время показываем загрузку (см. isProfileLoading ниже),
  // иначе поле выглядело пустым и отчество «появлялось с задержкой».
  const queryClient = useQueryClient();
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: profileKeys.me(),
    queryFn: getProfile,
    staleTime: 60 * 1000,
  });

  // Синхронизация формы с ответом сервера прямо в рендере — тот же приём
  // «adjust state during render», что в кабинете врача (doctor/my-data).
  const [syncedProfile, setSyncedProfile] = useState<typeof profile>(undefined);
  if (profile && profile !== syncedProfile) {
    setSyncedProfile(profile);
    const next: D = {
      firstName: profile.first_name ?? "",
      lastName: profile.last_name ?? "",
      patronymic: profile.patronymic ?? "",
      phone: profile.phone ?? "",
      email: profile.email ?? "",
      photo: profile.avatar ?? undefined,
    };
    savedDataRef.current = next;
    setD(next);
    const current = useAuthStore.getState().user;
    if (current && profile.avatar && current.avatar !== profile.avatar) {
      useAuthStore.getState().setUser({ ...current, avatar: profile.avatar });
    }
  }

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => set("photo", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Text fields + new avatar (if any) go in one multipart request — the
      // API stores the image and returns its URL in `avatar`.
      const updated = await updateProfile({
        first_name: d.firstName,
        last_name: d.lastName,
        patronymic: d.patronymic,
        phone: d.phone || undefined,
        ...(pendingPhoto ? { avatar_upload: pendingPhoto } : {}),
      });

      const newAvatar = updated.avatar ?? d.photo;
      const savedData: D = {
        ...d,
        firstName: updated.first_name,
        lastName: updated.last_name,
        patronymic: updated.patronymic ?? d.patronymic,
        phone: updated.phone ?? d.phone,
        photo: newAvatar,
      };
      savedDataRef.current = savedData;
      setD(savedData);
      setPendingPhoto(null);
      // Кладём свежий профиль в кеш: без этого следующий заход на страницу
      // отрисовал бы старые значения из кеша и подменил их после запроса —
      // то самое «появляется с задержкой», от которого мы уходим.
      queryClient.setQueryData(profileKeys.me(), updated);
      setSyncedProfile(updated);

      // Keep authStore in sync so name and avatar update everywhere
      if (user) {
        setUser({
          ...user,
          first_name: updated.first_name,
          last_name: updated.last_name,
          phone: updated.phone ?? user.phone,
          avatar: newAvatar ?? user.avatar,
        });
      }

      toast.success("Данные сохранены");
      setIsEditing(false);
      setShowSaveConfirm(false);
    } catch {
      toast.error("Не удалось сохранить. Попробуйте снова");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setD(savedDataRef.current);
    setPendingPhoto(null);
    setIsEditing(false);
  };

  const title = isEditing ? "Редактировать" : "Настройки профиля";

  const mobileRight = (
    <IconBtn
      onClick={
        isEditing ? () => setShowSaveConfirm(true) : () => setIsEditing(true)
      }
      disabled={isSaving}
      variant="text"
      size="sm"
    >
      {isEditing ? (
        <CheckIcon className="w-5 h-5 [&_path]:stroke-primary" />
      ) : (
        <EditIcon className="w-5 h-5 [&_path]:stroke-muted" />
      )}
    </IconBtn>
  );

  return (
    <>
      <MobilePageHeader
        title={title}
        rightElement={mobileRight}
        onBack={isEditing ? handleCancel : undefined}
      />
      <div className="px-4 py-8 md:p-0">
        <div className="hidden md:flex items-center justify-between mb-6">
          <h2 className="text-[28px] font-semibold text-foreground">
            Настройки профиля
          </h2>
          <div className="flex items-center gap-3">
            {isEditing && (
              <CancelEditButton onClick={handleCancel} disabled={isSaving} />
            )}
            <Button
              onClick={
                isEditing
                  ? () => setShowSaveConfirm(true)
                  : () => setIsEditing(true)
              }
              disabled={isSaving}
              variant={isEditing ? "default" : "outline"}
              size="sm"
              IconLeft={isEditing ? undefined : EditIcon}
            >
              {isSaving
                ? "Сохранение..."
                : isEditing
                  ? "Сохранить"
                  : "Редактировать"}
            </Button>
          </div>
        </div>

        {/* Как в макете: заголовок внутри внешней карточки, поля — в узкой внутренней */}
        <div className="bg-white rounded-3xl border border-border p-5">
          <h3 className="text-base font-semibold text-foreground mb-4">
            Основная информация
          </h3>

          {isProfileLoading && !profile ? (
            // Пока профиль не пришёл, поля не рисуем: отчества в authStore нет,
            // и пустая строка выглядела бы как «у пациента нет отчества», а
            // затем значение подставлялось бы рывком.
            <div className="bg-white rounded-2xl border border-border p-5 max-w-md">
              <div className="flex flex-col gap-4">
                <div className="size-28 rounded-full skeleton" />
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="h-3 w-24 rounded skeleton" />
                    <div className="h-5 w-48 rounded skeleton" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border p-5 max-w-md">
              {/* Photo */}
              <div className="py-3 border-b border-background">
                <p className="block text-muted text-xs mb-1">Фото</p>
                <div className="relative w-28 h-28 mt-2">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-surface">
                    <ImageWithFallback
                      src={d.photo}
                      alt="Фото"
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                      unoptimized={d.photo?.startsWith("data:")}
                      fallback={
                        <div className="w-full h-full flex items-center justify-center text-muted text-3xl font-semibold">
                          {d.firstName.charAt(0) || "?"}
                        </div>
                      }
                    />
                  </div>
                  {isEditing && (
                    <>
                      <input
                        ref={photoRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhoto}
                        className="hidden"
                      />
                      <IconBtn
                        onClick={() => photoRef.current?.click()}
                        variant="outline"
                        size="xs"
                        className="absolute bottom-0 right-0 bg-white shadow-sm"
                      >
                        <EditIcon className="w-3.5 h-3.5 [&_path]:stroke-secondary" />
                      </IconBtn>
                    </>
                  )}
                </div>
              </div>

              {/* Fields */}
              {isEditing ? (
                <div className="space-y-4 pt-3">
                  {(
                    [
                      {
                        key: "firstName",
                        label: "Имя",
                        placeholder: "Введите имя",
                      },
                      {
                        key: "lastName",
                        label: "Фамилия",
                        placeholder: "Введите фамилию",
                      },
                      {
                        key: "patronymic",
                        label: "Отчество",
                        placeholder: "Введите отчество",
                      },
                      {
                        key: "phone",
                        label: "Номер телефона",
                        placeholder: "+996 000 000 000",
                      },
                      {
                        key: "email",
                        label: "Почта",
                        placeholder: "example@mail.com",
                      },
                    ] as { key: keyof D; label: string; placeholder: string }[]
                  ).map(({ key, label, placeholder }) => (
                    <div key={key}>
                      {key === "phone" ? (
                        <PhoneInput
                          label={label}
                          // PhoneInput работает с национальной частью; храним
                          // полный номер с кодом +996, конвертируем на границе
                          value={d.phone.replace(/^\+?996/, "")}
                          onChange={(v) => set("phone", v ? `+996${v}` : "")}
                        />
                      ) : (
                        <Input
                          label={label}
                          value={(d[key] as string) ?? ""}
                          onChange={(e) =>
                            set(key, e.target.value as D[typeof key])
                          }
                          placeholder={placeholder}
                          disabled={key === "email"}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <Field label="Имя" value={d.firstName} />
                  <Field label="Фамилия" value={d.lastName} />
                  <Field label="Отчество" value={d.patronymic} />
                  <Field label="Номер телефона" value={d.phone} />
                  <Field label="Почта" value={d.email} />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleSave}
        isLoading={isSaving}
        closeOnConfirm={false}
        icon={<CheckIcon className="w-7 h-7 text-primary" />}
        title="Сохранить изменения?"
        description="Обновлённые данные профиля будут сохранены"
        confirmLabel="Сохранить"
        cancelLabel="Отмена"
      />
    </>
  );
};
