"use client";

import { FC, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import Image from "next/image";

import { MobilePageHeader } from "@/widgets/profile/mobile-header";
import { ProfileSidebar } from "@/widgets/profile/sidebar";

import { getProfile, updateProfile } from "@/shared/api";
import { CheckIcon, EditIcon } from "@/shared/assets/icons";
import { useAuthStore } from "@/shared/store";
import { PhoneInput } from "@/shared/ui";

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

  // Pull the current avatar once so it shows even when the persisted auth user
  // predates the avatar field; also caches it in the store for other pages.
  useEffect(() => {
    let cancelled = false;
    getProfile()
      .then((profile) => {
        if (cancelled || !profile.avatar) return;
        setD((prev) => ({ ...prev, photo: profile.avatar ?? prev.photo }));
        const current = useAuthStore.getState().user;
        if (current) {
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

  const title = isEditing ? "Редактировать" : "Мои данные";

  const inp =
    "w-full px-4 py-3 rounded-2xl border border-border text-foreground placeholder:text-dim focus:outline-none focus:border-primary transition-colors bg-white text-base";
  const lbl = "block text-muted text-xs mb-1";

  const mobileRight = (
    <button
      onClick={isEditing ? handleSave : () => setIsEditing(true)}
      disabled={isSaving}
      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
    >
      {isEditing ? (
        <CheckIcon className="w-5 h-5 [&_path]:stroke-primary" />
      ) : (
        <EditIcon className="w-5 h-5 [&_path]:stroke-muted" />
      )}
    </button>
  );

  return (
    <>
      <MobilePageHeader title={title} rightElement={mobileRight} />

      <div className="w-full max-w-360 mx-auto px-4 md:px-10 py-8">
        <h1 className="text-[40px] font-semibold text-foreground mb-8 hidden md:block">
          Мой профиль
        </h1>

        <div className="flex gap-6">
          <aside className="hidden lg:block shrink-0">
            <ProfileSidebar />
          </aside>

          <main className="flex-1 min-w-0">
            <div className="hidden md:flex items-center justify-between mb-6">
              <h2 className="text-[28px] font-semibold text-foreground">
                Мои данные
              </h2>
              <button
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                disabled={isSaving}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-colors disabled:opacity-60 ${
                  isEditing
                    ? "bg-primary text-white hover:bg-primary-dark"
                    : "border border-border text-secondary hover:bg-surface"
                }`}
              >
                {isSaving
                  ? "Сохранение..."
                  : isEditing
                    ? "Сохранить"
                    : "Редактировать"}
              </button>
            </div>

            <h3 className="text-base font-semibold text-foreground mb-3">
              Основная информация
            </h3>

            <div className="bg-white rounded-3xl border border-border p-5">
              {/* Photo */}
              <div className="py-3 border-b border-background">
                <p className={lbl}>Фото</p>
                <div className="relative w-20 h-20 mt-2">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-surface">
                    {d.photo ? (
                      <Image
                        src={d.photo}
                        alt="Фото"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        unoptimized={d.photo.startsWith("data:")}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted text-2xl font-semibold">
                        {d.firstName.charAt(0) || "?"}
                      </div>
                    )}
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
                      <button
                        onClick={() => photoRef.current?.click()}
                        className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center shadow-sm"
                      >
                        <EditIcon className="w-3.5 h-3.5 [&_path]:stroke-secondary" />
                      </button>
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
                          value={d.phone}
                          onChange={(v) => set("phone", v)}
                        />
                      ) : (
                        <>
                          <label className={lbl}>{label}</label>
                          <input
                            value={(d[key] as string) ?? ""}
                            onChange={(e) =>
                              set(key, e.target.value as D[typeof key])
                            }
                            placeholder={placeholder}
                            disabled={key === "email"}
                            className={`${inp} ${key === "email" ? "opacity-50 cursor-not-allowed" : ""}`}
                          />
                        </>
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
          </main>
        </div>
      </div>
    </>
  );
};
