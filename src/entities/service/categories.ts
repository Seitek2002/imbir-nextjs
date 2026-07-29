"use client";

import { useQuery } from "@tanstack/react-query";

import { getServices, serviceKeys } from "@/shared/api";

// Справочника категорий услуг у бэка нет (/api/references/service-categories/
// и /api/services/categories/ отвечают 404), поэтому собираем категории из
// самих услуг. Так список предлагает только то, по чему реально что-то
// найдётся: раньше на /services было пять категорий из головы, и половины
// («Педиатрия», «Хирургия») в услугах не существует вовсе.
const CATEGORY_SAMPLE_SIZE = 200;

export const useServiceCategories = () => {
  const { data = [], isLoading } = useQuery({
    queryKey: [...serviceKeys.all, "categories"] as const,
    queryFn: async () => {
      const { data } = await getServices({ page_size: CATEGORY_SAMPLE_SIZE });
      const unique = new Set(
        data.map((service) => service.category).filter(Boolean),
      );
      return [...unique].sort((a, b) => a.localeCompare(b, "ru"));
    },
    staleTime: 60 * 60 * 1000,
  });

  return {
    categories: data,
    options: data.map((category) => ({ label: category, value: category })),
    isLoading,
  };
};
