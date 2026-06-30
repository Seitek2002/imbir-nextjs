import { cookies } from "next/headers";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { SpecialistsPage } from "@/pages/specialists";

import { api } from "@/shared/api";
import { CITY_COOKIE, DEFAULT_CITY } from "@/shared/store";

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

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["doctors", city],
    queryFn: () => api.getDoctors(city),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SpecialistsPage searchParams={resolvedSearchParams} initialCity={city} />
    </HydrationBoundary>
  );
};

export default Specialists;
