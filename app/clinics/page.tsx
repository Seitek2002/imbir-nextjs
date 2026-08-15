import { cookies } from "next/headers";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { ClinicsPage } from "@/pages/clinic/clinics";

import {
  ClinicFilters,
  api,
  clinicKeys,
  getSpecializations,
  referenceKeys,
} from "@/shared/api";
import { CITY_COOKIE, DEFAULT_CITY } from "@/shared/store";

const PAGE_SIZE = 8;

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

  const filters: Omit<ClinicFilters, "page" | "page_size"> = {
    city,
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
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  await Promise.all([
    queryClient.prefetchInfiniteQuery({
      queryKey: clinicKeys.list(filters),
      queryFn: () =>
        api.getClinicsPaginated({ ...filters, page: 1, page_size: PAGE_SIZE }),
      initialPageParam: 1,
    }),
    queryClient.prefetchQuery({
      queryKey: referenceKeys.specializations(),
      queryFn: getSpecializations,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClinicsPage initialCity={city} />
    </HydrationBoundary>
  );
}
