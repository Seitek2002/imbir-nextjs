import { cookies } from "next/headers";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { SpecialistsPage } from "@/pages/specialists";

import { api, doctorKeys } from "@/shared/api";
import { CITY_COOKIE, DEFAULT_CITY } from "@/shared/store";

// Должно совпадать с FULL_LIST_PAGE_SIZE в SpecialistsPage.tsx, иначе
// ключ запроса тут разойдётся с клиентским и SSR-префетч не подхватится.
const FULL_LIST_PAGE_SIZE = 200;

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const Specialists = async ({ searchParams }: Props) => {
  const resolvedSearchParams = await searchParams;

  // The doctors list is keyed by city. We read the city from a cookie the
  // client mirrors from its store, so the server prefetches the same city the
  // client will use — no hydration mismatch, and SSR works for every city.
  const cookieStore = await cookies();
  const raw = cookieStore.get(CITY_COOKIE)?.value;
  const city = raw ? decodeURIComponent(raw) : DEFAULT_CITY;

  const filters = { city, page_size: FULL_LIST_PAGE_SIZE };
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: doctorKeys.list(filters),
    queryFn: () => api.getDoctors(filters),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SpecialistsPage searchParams={resolvedSearchParams} initialCity={city} />
    </HydrationBoundary>
  );
};

export default Specialists;
