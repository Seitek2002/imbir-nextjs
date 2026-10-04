import { cookies } from "next/headers";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { ClinicsPage } from "@/pages/clinic/clinics";

import { ClinicFilters, api, clinicKeys, referenceKeys } from "@/shared/api";
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

// См. app/specialists/page.tsx: первая страница без фильтров — из серверного
// кеша, всё остальное — прямым запросом.
const readClinicsFirstPage = cachedPublicRead(
  "catalog-clinics-first-page",
  (city: string) =>
    api.getClinicsPaginated({ city, page: 1, page_size: PAGE_SIZE }),
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
    typeof params.clinic_spec === "string" ? params.clinic_spec : null;
  const currentRating =
    typeof params.clinic_rating === "string" ? params.clinic_rating : null;
  const currentExp =
    typeof params.clinic_exp === "string" ? params.clinic_exp : null;
  const currentPrice =
    typeof params.clinic_price === "string" ? params.clinic_price : null;
  const [priceMin, priceMax] = currentPrice
    ? currentPrice.split("-").map(Number)
    : [undefined, undefined];
  const [expMin, expMax] = currentExp
    ? currentExp.split("-").map(Number)
    : [undefined, undefined];

  const filters: Omit<ClinicFilters, "page_size" | "page"> = {
    city,
    search: activeQuery || undefined,
    specialization: currentSpec || undefined,
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
  const isDefaultView = Object.entries(filters).every(
    ([key, value]) => key === "city" || value === undefined,
  );
  await Promise.all([
    isDefaultView && isKnownCity(city)
      ? seedInfiniteQuery(
          queryClient,
          clinicKeys.list(filters),
          readClinicsFirstPage(city),
        )
      : queryClient.prefetchInfiniteQuery({
          queryKey: clinicKeys.list(filters),
          queryFn: () =>
            api.getClinicsPaginated({
              ...filters,
              page: 1,
              page_size: PAGE_SIZE,
            }),
          initialPageParam: 1,
        }),
    seedQuery(
      queryClient,
      referenceKeys.specializations("clinic"),
      readSpecializations("clinic"),
    ),
  ]);

  return (
    // См. app/specialists/page.tsx: без провайдера серверный HTML собрался бы
    // без фильтров из адреса.
    <UrlSearchParamsProvider>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ClinicsPage initialCity={city} />
      </HydrationBoundary>
    </UrlSearchParamsProvider>
  );
}
