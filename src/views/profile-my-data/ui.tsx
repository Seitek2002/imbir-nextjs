"use client";

import { FC, useRef, useState } from "react";

import Image from "next/image";

import { ProfileMobileHeader } from "@/widgets/profile-mobile-header";
import { ProfileSidebar } from "@/widgets/profile-sidebar";

import { CheckIcon, EditIcon } from "@/shared/assets";
import { PhoneInput } from "@/shared/ui";

type D = {
  firstName: string;
  lastName: string;
  patronymic: string;
  phone: string;
  email: string;
  photo?: string;
};

const MOCK: D = {
  firstName: "Айжан",
  lastName: "Курманова",
  patronymic: "Курмановна",
  phone: "",
  email: "",
};

const Field: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="py-3 border-b border-[#F2F3F5] last:border-0">
    <p className="text-[#838A8D] text-xs mb-1">{label}</p>
    <p className="text-[#191A1B] text-base">{value || "—"}</p>
  </div>
);

export const ProfileMyDataPage: FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [d, setD] = useState<D>(MOCK);
  const photoRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof D>(k: K, v: D[K]) =>
    setD((prev) => ({ ...prev, [k]: v }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => set("photo", reader.result as string);
    reader.readAsDataURL(file);
  };

  const title = isEditing ? "Редактировать" : "Мои данные";

  const inp =
    "w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] transition-colors bg-white text-base";
  const lbl = "block text-[#838A8D] text-xs mb-1";

  const mobileRight = (
    <button
      onClick={() => setIsEditing((v) => !v)}
      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F8F9FA] transition-colors"
    >
      {isEditing ? (
        <CheckIcon className="w-5 h-5 [&_path]:stroke-[#F5653E]" />
      ) : (
        <EditIcon className="w-5 h-5 [&_path]:stroke-[#838A8D]" />
      )}
    </button>
  );

  return (
    <>
      <ProfileMobileHeader title={title} rightElement={mobileRight} />

      <div className="w-full max-w-360 mx-auto px-4 md:px-10 py-8">
        <h1 className="text-[40px] font-semibold text-[#191A1B] mb-8 hidden md:block">
          Мой профиль
        </h1>

        <div className="flex gap-6">
          <aside className="hidden lg:block shrink-0">
            <ProfileSidebar />
          </aside>

          <main className="flex-1 min-w-0">
            <div className="hidden md:flex items-center justify-between mb-6">
              <h2 className="text-[28px] font-semibold text-[#191A1B]">
                Мои данные
              </h2>
              <button
                onClick={() => setIsEditing((v) => !v)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-colors ${
                  isEditing
                    ? "bg-[#F5653E] text-white hover:bg-[#E5542D]"
                    : "border border-[#E5E6E8] text-[#686F72] hover:bg-[#F8F9FA]"
                }`}
              >
                {isEditing ? "Сохранить" : "Редактировать"}
              </button>
            </div>

            <h3 className="text-base font-semibold text-[#191A1B] mb-3">
              Основная информация
            </h3>

            <div className="bg-white rounded-3xl border border-[#E5E6E8] p-5">
              {/* Photo */}
              <div className="py-3 border-b border-[#F2F3F5]">
                <p className={lbl}>Фото</p>
                <div className="relative w-20 h-20 mt-2">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-[#F8F9FA]">
                    {d.photo ? (
                      <Image
                        src={d.photo}
                        alt="Фото"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#838A8D] text-2xl font-semibold">
                        {d.firstName.charAt(0)}
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
                        className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border border-[#E5E6E8] flex items-center justify-center shadow-sm"
                      >
                        <EditIcon className="w-3.5 h-3.5 [&_path]:stroke-[#686F72]" />
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
                            className={inp}
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
