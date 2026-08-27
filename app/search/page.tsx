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

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const activeQuery = typeof params.q === "string" ? params.q : "";

  if (!activeQuery) return <SearchPage />;

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
  const doctorFilters: DoctorFilters = {
    min_rating:
      currentRating && currentRating !== "all"
        ? parseFloat(currentRating)
        : undefined,
    min_price: priceMin,
    max_price: priceMax,
    min_experience: expMin,
    max_experience: expMax,
    specialization: selectedSpecs.length === 1 ? selectedSpecs[0] : undefined,
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
    queryClient.prefetchQuery({
      queryKey: ["search-clinics", activeQuery],
      queryFn: () => api.getClinics({ search: activeQuery, page_size: 12 }),
    }),
    queryClient.prefetchQuery({
      queryKey: ["search-services", activeQuery],
      queryFn: () => api.getServices({ search: activeQuery, page_size: 20 }),
    }),
    queryClient.prefetchQuery({
      queryKey: referenceKeys.specializations("doctor"),
      queryFn: () => getSpecializations("doctor"),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SearchPage />
    </HydrationBoundary>
  );
}
