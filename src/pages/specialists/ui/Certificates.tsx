"use client";

import { ChangeEvent, Dispatch, FC, SetStateAction, useRef } from "react";

import Image from "next/image";

import { inp, lbl } from "../model/constants";
import { IProps } from "../model/types";

interface ICert extends IProps {
  certs: string[];
  setCerts: Dispatch<SetStateAction<string[]>>;
}

export const Certificates: FC<ICert> = ({
  isEditing,
  d,
  set,
  setCerts,
  certs,
}) => {
  const certRef = useRef<HTMLInputElement>(null);

  const handleCertUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setCerts((prev: string[]) => [...prev, reader.result as string]);
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-8">
      <h3 className="text-foreground font-semibold text-lg mb-6">
        Сертификаты и документы
      </h3>
      <div className="mb-6">
        {isEditing ? (
          <>
            <label className={lbl}>Номер лицензии</label>
            <input
              type="text"
              value={d.licenseNumber}
              onChange={(e) => set("licenseNumber", e.target.value)}
              placeholder="ЛИЦ-XXXXXX"
              className={inp}
            />
          </>
        ) : (
          <>
            <div className="text-muted text-sm mb-1">Номер лицензии</div>
            <div className="text-foreground text-base">
              {d.licenseNumber || "—"}
            </div>
          </>
        )}
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-muted text-sm">Сертификаты</div>
          {isEditing && (
            <>
              <input
                ref={certRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleCertUpload}
                className="hidden"
              />
              <button
                onClick={() => certRef.current?.click()}
                className="text-primary text-sm font-medium flex items-center gap-1 hover:text-primary-dark transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 2V12M2 7H12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Добавить
              </button>
            </>
          )}
        </div>
        {certs.length === 0 ? (
          <div className="text-dim text-sm">
            {isEditing ? "Нажмите «Добавить» для загрузки сертификата" : "—"}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {certs.map((cert, i) => (
              <div
                key={i}
                className="relative w-24 h-24 rounded-2xl overflow-hidden border border-border bg-surface"
              >
                <Image
                  src={cert}
                  alt={`Сертификат ${i + 1}`}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
                {isEditing && (
                  <button
                    onClick={() =>
                      setCerts((prev: string[]) =>
                        prev.filter((_, j) => j !== i),
                      )
                    }
                    className="absolute top-0 right-0 w-1/2 aspect-square bg-primary flex items-center justify-center"
                  >
                    <svg className="w-1/2 h-1/2" viewBox="0 0 8 8" fill="none">
                      <path
                        d="M6.5 1.5L1.5 6.5M1.5 1.5L6.5 6.5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
