import { cookies } from "next/headers";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { ClinicsPage } from "@/pages/clinic/clinics";

import { ClinicFilters, api, clinicKeys } from "@/shared/api";
import { CITY_COOKIE, DEFAULT_CITY } from "@/shared/store";

// Должно совпадать с PAGE_SIZE в clinics/ui.tsx, иначе ключ запроса тут
// разойдётся с клиентским и SSR-префетч не подхватится.
const PAGE_SIZE = 8;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  // Должно ЗНАЧЕНИЕ В ЗНАЧЕНИЕ совпадать с тем, как ClinicsPage (clinics/ui.tsx)
  // строит свой `filters` — иначе ключ запроса тут не совпадёт с клиентским и
  // HydrationBoundary ничего не подхватит (именно так раньше и было: сервер
  // префетчил {} без единого фильтра, а клиент почти всегда запрашивает хотя
  // бы город — префетч был не более чем шумом, клиент всё равно бил по API
  // заново).
  const cookieStore = await cookies();
  const rawCity = cookieStore.get(CITY_COOKIE)?.value;
  const city = rawCity ? decodeURIComponent(rawCity) : DEFAULT_CITY;

  const activeQuery =
    typeof resolvedSearchParams?.q === "string" ? resolvedSearchParams.q : "";
  const currentRating =
    typeof resolvedSearchParams?.clinic_rating === "string"
      ? resolvedSearchParams.clinic_rating
      : null;
  const currentExp =
    typeof resolvedSearchParams?.clinic_exp === "string"
      ? resolvedSearchParams.clinic_exp
      : null;
  const currentPrice =
    typeof resolvedSearchParams?.clinic_price === "string"
      ? resolvedSearchParams.clinic_price
      : null;

  const [priceMin, priceMax] = currentPrice
    ? currentPrice.split("-").map(Number)
    : [undefined, undefined];
  const [expMin, expMax] = currentExp
    ? currentExp.split("-").map(Number)
    : [undefined, undefined];

  const filters: Omit<ClinicFilters, "page" | "page_size"> = {
    city: city || undefined,
    search: activeQuery || undefined,
    min_rating:
      currentRating && currentRating !== "all"
        ? parseFloat(currentRating)
        : undefined,
    min_price: priceMin,
    max_price: priceMax,
    min_experience: expMin,
    max_experience: expMax,
  };

  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: clinicKeys.list(filters),
    queryFn: () =>
      api.getClinicsPaginated({ ...filters, page: 1, page_size: PAGE_SIZE }),
    initialPageParam: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClinicsPage searchParams={resolvedSearchParams} initialCity={city} />
    </HydrationBoundary>
  );
}
