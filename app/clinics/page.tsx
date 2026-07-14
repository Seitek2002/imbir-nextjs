import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { ClinicsPage } from "@/pages/clinic/clinics";

import { api, clinicKeys } from "@/shared/api";

// Должно совпадать с PAGE_SIZE в clinics/ui.tsx, иначе ключ запроса тут
// разойдётся с клиентским и SSR-префетч не подхватится.
const PAGE_SIZE = 8;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  // Prefetch on the server so the list is in the initial HTML (faster LCP +
  // indexable). Клиент использует useInfiniteQuery — префетч обязан быть
  // именно prefetchInfiniteQuery (форма { pages, pageParams }), а не обычный
  // prefetchQuery. Раньше здесь был prefetchQuery под ключом ["clinics"] —
  // с клиентским clinicKeys.list(filters) он не совпадал вообще, так что
  // просто впустую тратил запрос на сервере, ничего не ускоряя. prefetchQuery
  // никогда не бросает исключение, так что нестабильный API не даст 500.
  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: clinicKeys.list({}),
    queryFn: () => api.getClinicsPaginated({ page: 1, page_size: PAGE_SIZE }),
    initialPageParam: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClinicsPage searchParams={resolvedSearchParams} />
    </HydrationBoundary>
  );
}
