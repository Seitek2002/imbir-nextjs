import { cookies } from "next/headers";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { SpecialistsPage } from "@/pages/specialists";

import { api, doctorKeys } from "@/shared/api";
import { CITY_COOKIE, DEFAULT_CITY } from "@/shared/store";

// Должно совпадать с PAGE_SIZE в SpecialistsPage.tsx, иначе ключ запроса тут
// разойдётся с клиентским и SSR-префетч не подхватится.
const PAGE_SIZE = 8;

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

  // Клиент использует useInfiniteQuery — префетч обязан быть именно
  // prefetchInfiniteQuery (форма { pages, pageParams }), а не обычный
  // prefetchQuery. Раньше здесь был prefetchQuery с page_size=200 (плоский
  // массив) — ключ не совпадал с клиентским useInfiniteQuery (там
  // page_size=8 приходит через pageParam, а не через filters), так что
  // префетч просто ничего не ускорял.
  const filters = { city };
  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: doctorKeys.list(filters),
    queryFn: () =>
      api.getDoctorsPaginated({ ...filters, page: 1, page_size: PAGE_SIZE }),
    initialPageParam: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SpecialistsPage searchParams={resolvedSearchParams} initialCity={city} />
    </HydrationBoundary>
  );
};

export default Specialists;
