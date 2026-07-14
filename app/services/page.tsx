import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { ServicesPage } from "@/pages/services";

import { api, serviceKeys } from "@/shared/api";

// Должно совпадать с PAGE_SIZE в ServicesPage.tsx, иначе ключ запроса тут
// разойдётся с клиентским и SSR-префетч не подхватится (либо, что хуже,
// подхватится некорректно — см. комментарий ниже про форму infinite-query).
const PAGE_SIZE = 8;

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const Services = async ({ searchParams }: Props) => {
  const resolvedSearchParams = await searchParams;

  // Prefetch on the server so the list ships in the initial HTML; the
  // client's default (no-filter) query hydrates this instead of refetching.
  // Важно: клиент использует useInfiniteQuery — префетч обязан быть именно
  // prefetchInfiniteQuery (форма { pages, pageParams }), а не обычный
  // prefetchQuery. Раньше здесь был prefetchQuery с плоским массивом; его
  // ключ (serviceKeys.list({})) хеш-совпадал с клиентским (все фильтры по
  // умолчанию undefined хешируются так же, как {}), поэтому гидратация
  // подставляла клиенту данные не той формы, и useInfiniteQuery падал при
  // попытке прочитать .pages на плоском массиве.
  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: serviceKeys.list({}),
    queryFn: () =>
      api.getServicesPaginated({ page: 1, page_size: PAGE_SIZE }),
    initialPageParam: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ServicesPage searchParams={resolvedSearchParams} />
    </HydrationBoundary>
  );
};

export default Services;
