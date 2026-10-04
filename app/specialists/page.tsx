import { cookies } from "next/headers";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { SpecialistsPage } from "@/pages/specialists";

import { DoctorFilters, api, doctorKeys, referenceKeys } from "@/shared/api";
import {
  cachedPublicRead,
  isKnownCity,
  readSpecializations,
  seedInfiniteQuery,
  seedQuery,
} from "@/shared/api/server-cache";
import { UrlSearchParamsProvider } from "@/shared/lib/url-state";
import { CITY_COOKIE, DEFAULT_CITY } from "@/shared/store";

const PAGE_SIZE = 8;

// Первая страница каталога без фильтров одинакова для всех посетителей из
// одного города — её держим в серверном кеше, чтобы переход в каталог не ждал
// бэк (подробности в shared/api/server-cache.ts). Запрос с фильтрами или
// поиском в кеш не идёт: сочетаний слишком много.
const readDoctorsFirstPage = cachedPublicRead(
  "catalog-doctors-first-page",
  (city: string) =>
    api.getDoctorsPaginated({ city, page: 1, page_size: PAGE_SIZE }),
  60,
);

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const cookieStore = await cookies();
  const rawCity = cookieStore.get(CITY_COOKIE)?.value;
  const city = rawCity ? decodeURIComponent(rawCity) : DEFAULT_CITY;

  const params = await searchParams;
  const activeQuery = typeof params.q === "string" ? params.q : "";
  const currentSpec =
    typeof params.doc_spec === "string" ? params.doc_spec : null;
  const currentRating =
    typeof params.doc_rating === "string" ? params.doc_rating : null;
  const currentExp = typeof params.doc_exp === "string" ? params.doc_exp : null;
  const currentPrice =
    typeof params.doc_price === "string" ? params.doc_price : null;
  const selectedSpecs = currentSpec?.split(",").filter(Boolean) ?? [];
  const [priceMin, priceMax] = currentPrice
    ? currentPrice.split("-").map(Number)
    : [undefined, undefined];
  const [expMin, expMax] = currentExp
    ? currentExp.split("-").map(Number)
    : [undefined, undefined];

  const filters: Omit<DoctorFilters, "page_size" | "page"> = {
    city,
    search: activeQuery || undefined,
    specialization:
      selectedSpecs.length > 0 ? selectedSpecs.join(",") : undefined,
    min_rating:
      currentRating && currentRating !== "all"
        ? parseFloat(currentRating)
        : undefined,
    min_price: priceMin,
    max_price: priceMax,
    min_experience: expMin,
    max_experience: expMax,
  };
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  // Фильтров нет, если заполнен только город.
  const isDefaultView = Object.entries(filters).every(
    ([key, value]) => key === "city" || value === undefined,
  );
  await Promise.all([
    isDefaultView && isKnownCity(city)
      ? seedInfiniteQuery(
          queryClient,
          doctorKeys.list(filters),
          readDoctorsFirstPage(city),
        )
      : queryClient.prefetchInfiniteQuery({
          queryKey: doctorKeys.list(filters),
          queryFn: () =>
            api.getDoctorsPaginated({
              ...filters,
              page: 1,
              page_size: PAGE_SIZE,
            }),
          initialPageParam: 1,
        }),
    seedQuery(
      queryClient,
      referenceKeys.specializations("doctor"),
      readSpecializations("doctor"),
    ),
  ]);

  return (
    // Фильтры страницы живут в адресе, и серверный HTML обязан собраться с
    // теми же параметрами, по которым выше сделан префетч.
    <UrlSearchParamsProvider>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SpecialistsPage initialCity={city} />
      </HydrationBoundary>
    </UrlSearchParamsProvider>
  );
}
