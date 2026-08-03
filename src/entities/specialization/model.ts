"use client";

import type { StaticImageData } from "next/image";

import { useQuery } from "@tanstack/react-query";

import { getSpecializations, referenceKeys } from "@/shared/api";
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
// один запрос. Мусорные записи без кириллицы ("das", "test") отфильтровываем
// здесь же, до попадания в тайлы/дропдауны.
export const useSpecializations = (enabled = true) => {
  const query = useQuery({
    queryKey: referenceKeys.specializations(),
    queryFn: getSpecializations,
    enabled,
    staleTime: 60 * 60 * 1000,
  });

  return {
    ...query,
    data: query.data?.filter((item) => hasCyrillic(item.name)),
  };
};

// Готовые options для Dropdown. Значение = само название: именно оно уходит на
// бэк в primary_specializations/narrow_specializations и по нему же работают
// фильтры врачей, поэтому никаких собственных кодов ("cardiologist") тут быть
// не должно.
export const useSpecializationOptions = (enabled = true) => {
  const { data = [], isLoading } = useSpecializations(enabled);

  return {
    options: data.map((item) => ({ label: item.name, value: item.name })),
    isLoading,
  };
};

export const useSpecializationTiles = (limit = SPECIALIZATION_TILES_LIMIT) => {
  const { data = [], isLoading } = useSpecializations();

  const tiles = data.slice(0, limit).map(({ name, photo }) => {
    return {
      name,
      image: photo ?? getSpecializationImage(name),
      href: `${ROUTES.SPECIALISTS}?doc_spec=${encodeURIComponent(name)}`,
    };
  });

  return { tiles, isLoading, limit };
};
