"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getServiceCategories,
  getServiceCategoryList,
  referenceKeys,
} from "@/shared/api";
import { mergeReference } from "@/shared/lib/useReference";

// Запасной набор для форм — пока бэк не выкатил справочник категорий
// (GET /api/service-categories/) или он пуст. Старый /references/service-
// categories/ — это лишь категории уже созданных услуг, а там все были
// «Процедурами», поэтому без запасного набора выбирать было не из чего.
const DEFAULT_SERVICE_CATEGORIES = [
  "Консультации",
  "Диагностика",
  "Анализы",
  "УЗИ",
  "Процедуры",
  "Инъекции и капельницы",
  "Массаж",
  "Физиотерапия",
  "Реабилитация",
  "Хирургия",
  "Стоматология",
  "Косметология",
  "Вакцинация",
  "Медосмотры и справки",
  "Вызов на дом",
];

const toOptions = (values: string[]) =>
  values.map((value) => ({ label: value, value }));

export const useServiceCategories = () => {
  // Старый список строк — только для фильтров каталога (бэк просил их на
  // новый справочник пока не переключать).
  const { data = [], isLoading: isLegacyLoading } = useQuery({
    queryKey: referenceKeys.serviceCategories(),
    queryFn: getServiceCategories,
    staleTime: 60 * 60 * 1000,
  });
  // Новый справочник для форм. До выкатки отвечает 404 — без повторов,
  // чтобы форма не висела в «Загружаем список...».
  const { data: refs = [], isLoading: isRefsLoading } = useQuery({
    queryKey: referenceKeys.serviceCategoryList(),
    queryFn: getServiceCategoryList,
    staleTime: 60 * 60 * 1000,
    retry: false,
  });

  const formValues =
    refs.length > 0
      ? refs.map((ref) => ref.title)
      : mergeReference(DEFAULT_SERVICE_CATEGORIES, data);

  return {
    categories: data,
    // Для выбора категории в форме услуги. Значение — название: его же
    // отправляем в старое поле category, а id ищем через resolveCategoryId.
    options: toOptions(formValues),
    // Те же варианты плюс текущая категория услуги, если её нет в списке
    // (старый текст), — иначе при правке поле выглядело бы пустым.
    optionsWith: (selected: string) =>
      toOptions(
        selected && !formValues.includes(selected)
          ? [...formValues, selected]
          : formValues,
      ),
    // id записи справочника для service_category_id; null — записи нет
    // (справочник ещё не выкачен или выбран старый текст).
    resolveCategoryId: (title: string): null | number =>
      refs.find((ref) => ref.title === title)?.id ?? null,
    // Для фильтров каталога: только категории, у которых есть услуги.
    usedOptions: toOptions(data),
    isLoading: isLegacyLoading || isRefsLoading,
  };
};
