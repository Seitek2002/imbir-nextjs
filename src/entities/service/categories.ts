"use client";

import { useQuery } from "@tanstack/react-query";

import { getServiceCategories, referenceKeys } from "@/shared/api";
import { mergeReference } from "@/shared/lib/useReference";

// Набор для форм создания услуги. Справочник бэка — это не каталог, а
// категории уже существующих услуг (отдельной таблицы нет, category — просто
// строка). Все услуги в базе были «Процедурами», поэтому и список состоял из
// одной позиции, а новые услуги получали её же — круг замыкался. Бэк принимает
// любую строку, так что варианты задаём здесь; новые значения из базы
// добавляются в конец списка.
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

// Справочник появился после нашей просьбы (раньше оба кандидата — /references/
// service-categories/ и /services/categories/ — отвечали 404, и категории
// приходилось собирать из самих услуг).
export const useServiceCategories = () => {
  const { data = [], isLoading } = useQuery({
    queryKey: referenceKeys.serviceCategories(),
    queryFn: getServiceCategories,
    staleTime: 60 * 60 * 1000,
  });

  return {
    categories: data,
    // Для выбора категории в форме услуги.
    options: toOptions(mergeReference(DEFAULT_SERVICE_CATEGORIES, data)),
    // Для фильтров каталога: только категории, у которых есть услуги, иначе
    // фильтр предлагал бы варианты с пустой выдачей.
    usedOptions: toOptions(data),
    isLoading,
  };
};
