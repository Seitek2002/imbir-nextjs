import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { ClinicsPage } from "@/pages/clinic/clinics";

import { api } from "@/shared/api";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  // Prefetch on the server so the list is in the initial HTML (faster LCP +
  // indexable). The client's useQuery(["clinics"]) hydrates this instead of
  // fetching again. prefetchQuery never throws, so a flaky API won't 500.
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["clinics"],
    queryFn: api.getClinics,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClinicsPage searchParams={resolvedSearchParams} />
    </HydrationBoundary>
  );
}
