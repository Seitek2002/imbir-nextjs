import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { SearchPage } from "@/pages/search";

import { DoctorFilters, api, doctorKeys } from "@/shared/api";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  // Должно ЗНАЧЕНИЕ В ЗНАЧЕНИЕ совпадать с тем, как SearchPage (search/ui.tsx)
  // строит свои три useQuery — иначе ключи не совпадут и HydrationBoundary
  // ничего не подхватит (тот же приём, что на /clinics и /services). Раньше
  // тут префетча не было вообще: заголовок "Результаты по запросу" — LCP-
  // элемент страницы — не мог отрисоваться, пока после гидратации не
  // отработают все три клиентских запроса (см. Lighthouse: ~2.25с render delay).
  const activeQuery =
    typeof resolvedSearchParams?.q === "string" ? resolvedSearchParams.q : "";
  const currentRating =
    typeof resolvedSearchParams?.doc_rating === "string"
      ? resolvedSearchParams.doc_rating
      : null;
  const currentExp =
    typeof resolvedSearchParams?.doc_exp === "string"
      ? resolvedSearchParams.doc_exp
      : null;
  const currentPrice =
    typeof resolvedSearchParams?.doc_price === "string"
      ? resolvedSearchParams.doc_price
      : null;
  const isOnlineOnly = resolvedSearchParams?.doc_online === "true";
  const currentSpec =
    typeof resolvedSearchParams?.doc_spec === "string"
      ? resolvedSearchParams.doc_spec
      : null;

  const [priceMin, priceMax] = currentPrice
    ? currentPrice.split("-").map(Number)
    : [undefined, undefined];
  const [expMin, expMax] = currentExp
    ? currentExp.split("-").map(Number)
    : [undefined, undefined];
  const selectedSpecs = currentSpec
    ? currentSpec.split(",").filter(Boolean)
    : [];

  const doctorFilters: DoctorFilters = {
    is_online: isOnlineOnly || undefined,
    min_rating:
      currentRating && currentRating !== "all"
        ? parseFloat(currentRating)
        : undefined,
    min_price: priceMin,
    max_price: priceMax,
    min_experience: expMin,
    max_experience: expMax,
    specialization: selectedSpecs.length === 1 ? selectedSpecs[0] : undefined,
    search: activeQuery || undefined,
    page_size: 200,
  };

  const queryClient = new QueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: doctorKeys.list(doctorFilters),
      queryFn: () => api.getDoctors(doctorFilters),
    }),
    queryClient.prefetchQuery({
      queryKey: ["clinics"],
      queryFn: () => api.getClinics(),
    }),
    queryClient.prefetchQuery({
      queryKey: ["services"],
      queryFn: () => api.getServices(),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SearchPage searchParams={resolvedSearchParams} />
    </HydrationBoundary>
  );
}
