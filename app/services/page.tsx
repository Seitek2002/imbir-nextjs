import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { ServicesPage } from "@/pages/services";

import { api, serviceKeys } from "@/shared/api";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const Services = async ({ searchParams }: Props) => {
  const resolvedSearchParams = await searchParams;

  // Prefetch on the server so the list ships in the initial HTML; the
  // client's default (no-filter) query hydrates this instead of refetching.
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: serviceKeys.list({}),
    queryFn: () => api.getServices(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ServicesPage searchParams={resolvedSearchParams} />
    </HydrationBoundary>
  );
};

export default Services;
