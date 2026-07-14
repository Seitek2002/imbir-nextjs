"use client";

import { FC, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { MobilePageHeader } from "@/widgets/profile/mobile-header";

import { getProfile, updateProfile } from "@/shared/api";
import { CheckIcon, EditIcon } from "@/shared/assets/icons";
import { useAuthStore } from "@/shared/store";
import {
  Button,
  IconBtn,
  ImageWithFallback,
  Input,
  PhoneInput,
} from "@/shared/ui";

type D = {
  firstName: string;
  lastName: string;
  patronymic: string;
  phone: string;
  email: string;
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

  const savedPatronymic =
    typeof window !== "undefined"
      ? (localStorage.getItem("profile_patronymic") ?? "")
      : "";

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [d, setD] = useState<D>({
    firstName: user?.first_name ?? "",
    lastName: user?.last_name ?? "",
    patronymic: savedPatronymic,
    phone: user?.phone ?? "",
    email: user?.email ?? "",
    photo: user?.avatar ?? undefined,
  });
  const photoRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof D>(k: K, v: D[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  // Подтягиваем актуальный профиль с бэка и сидируем ВСЕ поля — иначе после
  // жёсткой перезагрузки (когда authStore ещё не гидратировался) форма пустая.
  useEffect(() => {
    let cancelled = false;
    getProfile()
      .then((profile) => {
        if (cancelled) return;
        setD((prev) => ({
          ...prev,
          firstName: profile.first_name ?? prev.firstName,
          lastName: profile.last_name ?? prev.lastName,
          phone: profile.phone ?? prev.phone,
          email: profile.email ?? prev.email,
          photo: profile.avatar ?? prev.photo,
        }));
        const current = useAuthStore.getState().user;
        if (current && profile.avatar) {
          useAuthStore
            .getState()
            .setUser({ ...current, avatar: profile.avatar });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

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
        phone: d.phone || undefined,
        ...(pendingPhoto ? { avatar_upload: pendingPhoto } : {}),
      });

      // Patronymic — localStorage only (not in API schema)
      localStorage.setItem("profile_patronymic", d.patronymic);

      const newAvatar = updated.avatar ?? d.photo;
      if (newAvatar) set("photo", newAvatar);
      setPendingPhoto(null);

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
    } catch {
      toast.error("Не удалось сохранить. Попробуйте снова");
    } finally {
      setIsSaving(false);
    }
  };

  const title = isEditing ? "Редактировать" : "Настройки профиля";

  const mobileRight = (
    <IconBtn
      onClick={isEditing ? handleSave : () => setIsEditing(true)}
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
      <MobilePageHeader title={title} rightElement={mobileRight} />
      <div className="px-4 py-8 md:p-0">
        <div className="hidden md:flex items-center justify-between mb-6">
          <h2 className="text-[28px] font-semibold text-foreground">
            Настройки профиля
          </h2>
          <Button
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
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

        {/* Как в макете: заголовок внутри внешней карточки, поля — в узкой внутренней */}
        <div className="bg-white rounded-3xl border border-border p-5">
          <h3 className="text-base font-semibold text-foreground mb-4">
            Основная информация
          </h3>

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
        </div>
      </div>
    </>
  );
};
