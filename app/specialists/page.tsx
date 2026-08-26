import { cookies } from "next/headers";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { SpecialistsPage } from "@/pages/specialists";

import {
  DoctorFilters,
  api,
  doctorKeys,
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
  await Promise.all([
    queryClient.prefetchInfiniteQuery({
      queryKey: doctorKeys.list(filters),
      queryFn: () =>
        api.getDoctorsPaginated({ ...filters, page: 1, page_size: PAGE_SIZE }),
      initialPageParam: 1,
    }),
    queryClient.prefetchQuery({
      queryKey: referenceKeys.specializations(),
      queryFn: getSpecializations,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SpecialistsPage initialCity={city} />
    </HydrationBoundary>
  );
}
