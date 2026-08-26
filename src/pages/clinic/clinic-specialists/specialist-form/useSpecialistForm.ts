"use client";

import { useState } from "react";

import { EMPTY_SPECIALIST_FORM, type SpecialistFormState } from "./model";

// Локальное состояние анкеты специалиста. Отправкой занимается вызывающая
// сторона: POST /api/clinic/doctors/ при создании и PATCH
// /api/clinic/doctors/{id}/ при правке (см. useSpecialistDetail).
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

  return { d, set };
};
