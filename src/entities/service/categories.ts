"use client";

import { useQuery } from "@tanstack/react-query";

import { getServiceCategories, referenceKeys } from "@/shared/api";

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
    options: data.map((category) => ({ label: category, value: category })),
    isLoading,
  };
};
