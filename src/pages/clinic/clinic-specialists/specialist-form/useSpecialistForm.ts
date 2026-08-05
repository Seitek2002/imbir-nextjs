"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { EMPTY_SPECIALIST_FORM, type SpecialistFormState } from "./model";

// Локальное состояние анкеты специалиста. У бэка нет ни эндпоинта для
// создания врача клиникой напрямую, ни эндпоинта для чтения/правки детального
// профиля уже прикреплённого врача (только список + открепление) — поэтому
// «сохранение» здесь ничего не отправляет на сервер, только показывает
// пояснение. Верстка полностью рабочая (можно печатать/переключать), чтобы
// её можно было включить одним PATCH, когда бэк добавит нужные ручки.
export const useSpecialistForm = (initial?: Partial<SpecialistFormState>) => {
  const [d, setD] = useState<SpecialistFormState>({
    ...EMPTY_SPECIALIST_FORM,
    ...initial,
  });

  // Данные специалиста грузятся асинхронно, а useState-инициализатор отработает
  // лишь однажды (на первом рендере initial обычно ещё пустой). Пересеиваем
  // форму, когда приходит новое начальное значение — его ссылку даёт
  // мемоизированный initialForm из useSpecialistDetail, поэтому это происходит
  // один раз на загрузку, а не на каждый рендер.
  const [seededFrom, setSeededFrom] = useState(initial);
  if (initial && initial !== seededFrom) {
    setSeededFrom(initial);
    setD({ ...EMPTY_SPECIALIST_FORM, ...initial });
  }

  const set = <K extends keyof SpecialistFormState>(
    key: K,
    value: SpecialistFormState[K],
  ) => setD((prev) => ({ ...prev, [key]: value }));

  const notifyNotConnected = () =>
    toast(
      "Сохранение анкеты специалиста пока не подключено к бэкенду — данные видны только у вас в браузере",
      { icon: "ℹ️" },
    );

  return { d, set, notifyNotConnected };
};
