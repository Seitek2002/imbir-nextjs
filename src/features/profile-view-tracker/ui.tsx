"use client";

import { FC, useEffect } from "react";

import { trackClinicProfileView, trackDoctorProfileView } from "@/shared/api";

type Props = {
  id: string;
  kind: "clinic" | "doctor";
};

const storageKey = (kind: Props["kind"], id: string) =>
  `imbir:profile-view:${kind}:${id}`;

// Засчитывает просмотр анкеты врача или клиники. Страницы отдаются из
// ISR-кеша, а данные клиент берёт из initialData, поэтому GET детальной до
// бэка почти не доходил, и счётчик просмотров стоял на месте. Шлём отдельный
// POST — один раз за сессию вкладки, чтобы обновления страницы не накручивали
// счётчик. Ошибки молча игнорируем: на работу страницы они не влияют.
export const ProfileViewTracker: FC<Props> = ({ id, kind }) => {
  useEffect(() => {
    const key = storageKey(kind, id);
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage недоступен (приватный режим и т.п.) — просто шлём.
    }
    const track =
      kind === "doctor" ? trackDoctorProfileView : trackClinicProfileView;
    track(id).catch(() => undefined);
  }, [id, kind]);

  return null;
};
