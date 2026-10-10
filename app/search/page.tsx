import { cookies } from "next/headers";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { SearchPage } from "@/pages/search";

import {
  DoctorFilters,
  api,
  doctorKeys,
  getSpecializations,
  referenceKeys,
} from "@/shared/api";
import { UrlSearchParamsProvider } from "@/shared/lib/url-state";
import { CITY_COOKIE, DEFAULT_CITY } from "@/shared/store";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Город — выбранный пользователем (cookie зеркалит стор). Без явного city
  // бэк подставлял город по IP запроса, а здесь это IP сервера Netlify.
  const cookieStore = await cookies();
  const rawCity = cookieStore.get(CITY_COOKIE)?.value;
  const city = rawCity ? decodeURIComponent(rawCity) : DEFAULT_CITY;

  const params = await searchParams;
  const activeQuery = typeof params.q === "string" ? params.q : "";

  // Провайдер нужен в обеих ветках: страница поиска читает запрос и фильтры
  // из адреса (см. app/specialists/page.tsx).
  if (!activeQuery) {
    return (
      <UrlSearchParamsProvider>
        <SearchPage initialCity={city} />
      </UrlSearchParamsProvider>
    );
  }

  const currentRating =
    typeof params.doc_rating === "string" ? params.doc_rating : null;
  const currentExp = typeof params.doc_exp === "string" ? params.doc_exp : null;
  const currentPrice =
    typeof params.doc_price === "string" ? params.doc_price : null;
  const currentSpec =
    typeof params.doc_spec === "string" ? params.doc_spec : null;
  const selectedSpecs = currentSpec?.split(",").filter(Boolean) ?? [];
  const [priceMin, priceMax] = currentPrice
    ? currentPrice.split("-").map(Number)
    : [undefined, undefined];
  const [expMin, expMax] = currentExp
    ? currentExp.split("-").map(Number)
    : [undefined, undefined];
  // Должно совпадать с doctorFilters в SearchPage, иначе ключ разойдётся с
  // клиентским и префетч не подхватится.
  const doctorFilters: DoctorFilters = {
    city,
    min_rating:
      currentRating && currentRating !== "all"
        ? parseFloat(currentRating)
        : undefined,
    min_price: priceMin,
    max_price: priceMax,
    min_experience: expMin,
    max_experience: expMax,
    specialization:
      selectedSpecs.length > 0 ? selectedSpecs.join(",") : undefined,
    search: activeQuery,
    page_size: 24,
  };

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: doctorKeys.list(doctorFilters),
      queryFn: () => api.getDoctors(doctorFilters),
    }),
    // Ключ и параметры — как в SearchPage: специализация в ключе только если
    // выбрана.
    queryClient.prefetchQuery({
      queryKey: doctorFilters.specialization
        ? ["search-clinics", activeQuery, city, doctorFilters.specialization]
        : ["search-clinics", activeQuery, city],
      queryFn: () =>
        api.getClinics({
          search: activeQuery,
          city,
          specialization: doctorFilters.specialization,
          page_size: 12,
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: ["search-services", activeQuery, city],
      queryFn: () =>
        api.getServices({ search: activeQuery, city, page_size: 20 }),
    }),
    queryClient.prefetchQuery({
      queryKey: referenceKeys.specializations("doctor"),
      queryFn: () => getSpecializations("doctor"),
    }),
  ]);

  return (
    <UrlSearchParamsProvider>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SearchPage initialCity={city} />
      </HydrationBoundary>
    </UrlSearchParamsProvider>
  );
}
