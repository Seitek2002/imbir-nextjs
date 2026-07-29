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

// Сколько плиток показываем — одинаково на Главной и в блоке «Категории»
// глобального поиска, чтобы наборы не разъезжались.
export const SPECIALIZATION_TILES_LIMIT = 8;

// Иллюстраций у нас восемь, а справочник с бэка — это ~60 сырых названий, где
// одно и то же встречается в разных формах («Кардиолог» и «Кардиология», «ЛОР»,
// «ЛОР-врач» и «Отоларинголог»). Поэтому картинку подбираем по корню названия,
// а не по точному совпадению; для остальных карточка рисует нейтральный значок.
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

export type SpecializationTile = {
  name: string;
  image?: StaticImageData;
  href: string;
};

// Справочник почти не меняется — держим его в кеше подольше. Ключ тот же, что
// у фильтров (FilterBar/MobileFiltersModal), так что на всё приложение уходит
// один запрос.
export const useSpecializations = () =>
  useQuery({
    queryKey: referenceKeys.specializations(),
    queryFn: getSpecializations,
    staleTime: 60 * 60 * 1000,
  });

// Готовые options для Dropdown. Значение = само название: именно оно уходит на
// бэк в primary_specializations/narrow_specializations и по нему же работают
// фильтры врачей, поэтому никаких собственных кодов ("cardiologist") тут быть
// не должно.
export const useSpecializationOptions = () => {
  const { data = [], isLoading } = useSpecializations();

  return {
    options: data.map((name) => ({ label: name, value: name })),
    isLoading,
  };
};

export const useSpecializationTiles = (limit = SPECIALIZATION_TILES_LIMIT) => {
  const { data = [], isLoading } = useSpecializations();

  const tiles: SpecializationTile[] = data.slice(0, limit).map((name) => ({
    name,
    image: getSpecializationImage(name),
    href: `${ROUTES.SPECIALISTS}?doc_spec=${encodeURIComponent(name)}`,
  }));

  return { tiles, isLoading, limit };
};
