"use client";

import { ChangeEvent, FC, useRef } from "react";

import Image from "next/image";

import { Dropdown } from "@/shared/ui";
import { PhoneInput } from "@/shared/ui";

import { inp, lbl } from "../model/constants";
import { IProps } from "../model/types";

export const BasicInfo: FC<IProps> = ({ isEditing, d, set }) => {
  const photoRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => set("photo", reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-8">
      <h3 className="text-foreground font-semibold text-lg mb-6">
        Основная информация
      </h3>
      <div className="flex gap-8">
        <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-5">
          <div className="col-span-2">
            {isEditing ? (
              <>
                <label className={lbl}>ФИО</label>
                <input
                  type="text"
                  value={d.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="Введите ФИО"
                  className={inp}
                />
              </>
            ) : (
              <>
                <div className="text-muted text-sm mb-1">ФИО</div>
                <div className="text-foreground text-base font-medium">
                  {d.fullName}
                </div>
              </>
            )}
          </div>
          <div>
            {isEditing ? (
              <Dropdown
                label="Пол"
                placeholder="Выберите"
                options={[
                  { label: "Мужской", value: "Мужской" },
                  { label: "Женский", value: "Женский" },
                ]}
                value={d.gender}
                onChange={(val) => set("gender", val)}
              />
            ) : (
              <>
                <div className="text-muted text-sm mb-1">Пол</div>
                <div className="text-foreground text-base">
                  {d.gender || "—"}
                </div>
              </>
            )}
          </div>
          <div>
            {isEditing ? (
              <>
                <label className={lbl}>Дата рождения</label>
                <input
                  type="text"
                  value={d.birthDate}
                  onChange={(e) => set("birthDate", e.target.value)}
                  placeholder="ДД.ММ.ГГГГ"
                  className={inp}
                />
              </>
            ) : (
              <>
                <div className="text-muted text-sm mb-1">Дата рождения</div>
                <div className="text-foreground text-base">
                  {d.birthDate || "—"}
                </div>
              </>
            )}
          </div>
          <div>
            {isEditing ? (
              <>
                <label className={lbl}>Город</label>
                <input
                  type="text"
                  value={d.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Введите город"
                  className={inp}
                />
              </>
            ) : (
              <>
                <div className="text-muted text-sm mb-1">Город</div>
                <div className="text-foreground text-base">{d.city || "—"}</div>
              </>
            )}
          </div>
          <div>
            {isEditing ? (
              <>
                <label className={lbl}>Языки общения</label>
                <input
                  type="text"
                  value={d.languages}
                  onChange={(e) => set("languages", e.target.value)}
                  placeholder="Русский, Английский"
                  className={inp}
                />
              </>
            ) : (
              <>
                <div className="text-muted text-sm mb-1">Языки общения</div>
                <div className="text-foreground text-base">
                  {d.languages || "—"}
                </div>
              </>
            )}
          </div>
          <div>
            {isEditing ? (
              <PhoneInput
                label="Телефон"
                value={d.phone}
                onChange={(v) => set("phone", v)}
              />
            ) : (
              <>
                <div className="text-muted text-sm mb-1">Телефон</div>
                <div className="text-foreground text-base">
                  {d.phone || "—"}
                </div>
              </>
            )}
          </div>
          <div>
            {isEditing ? (
              <>
                <label className={lbl}>Почта</label>
                <input
                  type="email"
                  value={d.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="example@mail.com"
                  className={inp}
                />
              </>
            ) : (
              <>
                <div className="text-muted text-sm mb-1">Почта</div>
                <div className="text-foreground text-base">
                  {d.email || "—"}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-center gap-3 pt-6">
          <div className="w-30 h-30 rounded-2xl overflow-hidden bg-surface border border-border flex items-center justify-center">
            {d.photo ? (
              <Image
                src={d.photo}
                alt="Фото врача"
                width={120}
                height={120}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#E5E6E8" />
                <path
                  d="M24 12C17.37 12 12 17.37 12 24s5.37 12 12 12 12-5.37 12-12-5.37-12-12-12zm0 6c1.99 0 3.6 1.61 3.6 3.6S25.99 25.2 24 25.2s-3.6-1.61-3.6-3.6S22.01 18 24 18zm0 15.6c-3.2 0-6-.8-7.8-3.42.04-2.47 4.92-3.86 7.8-3.86 2.86 0 7.76 1.39 7.8 3.86C29.8 32.8 27.2 33.6 24 33.6z"
                  fill="#C4C8CA"
                />
              </svg>
            )}
          </div>
          {isEditing && (
            <>
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                onClick={() => photoRef.current?.click()}
                className="px-4 py-1.5 rounded-full border border-border text-secondary text-sm hover:bg-surface transition-colors"
              >
                Изменить фото
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
