"use client";

import type { StaticImageData } from "next/image";

import { useQuery } from "@tanstack/react-query";

import {
  type SpecializationItem,
  getSpecializations,
  referenceKeys,
} from "@/shared/api";
import {
  ServiceCardiology,
  ServiceDentistry,
  ServiceGastroenterology,
  ServiceGinecology,
  ServiceLor,
  ServiceNevrology,
  ServiceOphthalmology,
  ServicePulmonology,
} from "@/shared/assets/images";
import { ROUTES } from "@/shared/config";
import { hasCyrillic } from "@/shared/lib/useReference";

// Сколько плиток показываем — одинаково на Главной и в блоке «Категории»
// глобального поиска, чтобы наборы не разъезжались.
export const SPECIALIZATION_TILES_LIMIT = 8;

// Справочник теперь отдаёт свою картинку (photo) для части специализаций —
// её и используем в первую очередь. Эти правила остаются подстраховкой для
// значений без photo, плюс парой строк-мусора ("das", "test" — старые тестовые
// записи), которые попадаются раньше нормальных названий и не должны занимать
// место в выдаче.
const IMAGE_RULES: [RegExp, StaticImageData][] = [
  [/^лор|отоларинголог/i, ServiceLor],
  [/невролог/i, ServiceNevrology],
  [/гинеколог/i, ServiceGinecology],
  [/кардиолог/i, ServiceCardiology],
  [/пульмонолог/i, ServicePulmonology],
  [/офтальмолог|окулист/i, ServiceOphthalmology],
  [/гастроэнтеролог/i, ServiceGastroenterology],
  [/стоматолог/i, ServiceDentistry],
];

export const getSpecializationImage = (
  name: string,
): StaticImageData | undefined =>
  IMAGE_RULES.find(([pattern]) => pattern.test(name))?.[1];

// Справочник почти не меняется — держим его в кеше подольше. Ключ тот же, что
// у фильтров (FilterBar/MobileFiltersModal), так что на всё приложение уходит
// один запрос.
//
// Отдаёт СЫРОЙ список — включая мусорные записи без кириллицы ("das", "test").
// Это важно для resolveSpecializationIds: у доктора/клиники в проде реально
// может быть сохранена такая мусорная специализация (завели её до чистки
// справочника), и при следующем сохранении её название должно найти свой id и
// остаться на месте, а не потеряться молча из-за того, что мы её отфильтровали
// из списка для резолвинга. Фильтруем мусор только там, где он показывается
// пользователю — в useSpecializationOptions/useSpecializationTiles.
export const useSpecializations = (enabled = true) =>
  useQuery({
    queryKey: referenceKeys.specializations(),
    queryFn: getSpecializations,
    enabled,
    staleTime: 60 * 60 * 1000,
  });

// Готовые options для Dropdown. Значение = само название: по нему же работают
// фильтры врачей (specialization=Название), поэтому никаких собственных кодов
// ("cardiologist") тут быть не должно. При сохранении профиля врача/клиники
// имя обратно резолвится в id через resolveSpecializationIds — бэк принимает
// на запись только primary_specialization_ids/narrow_specialization_ids
// (числа), хотя на чтение отдаёт primary_specializations/narrow_specializations
// объектами {id, name, photo}.
export const useSpecializationOptions = (enabled = true) => {
  const { data = [], isLoading } = useSpecializations(enabled);

  return {
    options: data
      .filter((item) => hasCyrillic(item.name))
      .map((item) => ({ label: item.name, value: item.name })),
    isLoading,
  };
};

// "Терапия, Кардиология" + справочник → {ids: [9, 1], unmatched: []}.
// Нужно там, где специализации редактируются свободным текстом (клиника), а не
// строго через Dropdown (врач) — там опечатка или устаревшее название не
// находит совпадения в справочнике и должна быть замечена, а не молча исчезнуть.
export const resolveSpecializationIds = (
  names: string[],
  reference: SpecializationItem[],
): { ids: number[]; unmatched: string[] } => {
  const byName = new Map(
    reference.map((item) => [item.name.trim().toLowerCase(), item.id]),
  );
  const ids: number[] = [];
  const unmatched: string[] = [];

  for (const raw of names) {
    const name = raw.trim();
    if (!name) continue;
    const id = byName.get(name.toLowerCase());
    if (id !== undefined) ids.push(id);
    else unmatched.push(name);
  }

  return { ids, unmatched };
};

export const useSpecializationTiles = (limit = SPECIALIZATION_TILES_LIMIT) => {
  const { data = [], isLoading } = useSpecializations();

  const tiles = data
    .filter((item) => hasCyrillic(item.name))
    .slice(0, limit)
    .map(({ name, photo }) => {
      return {
        name,
        image: photo ?? getSpecializationImage(name),
        href: `${ROUTES.SPECIALISTS}?doc_spec=${encodeURIComponent(name)}`,
      };
    });

  return { tiles, isLoading, limit };
};
