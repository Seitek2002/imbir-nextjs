import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { ServicesPage } from "@/pages/services";

import { ServiceFilters, api, serviceKeys } from "@/shared/api";

// Должно совпадать с PAGE_SIZE в ServicesPage.tsx, иначе ключ запроса тут
// разойдётся с клиентским и SSR-префетч не подхватится (либо, что хуже,
// подхватится некорректно — см. комментарий ниже про форму infinite-query).
const PAGE_SIZE = 8;
// Должно совпадать с ServicesPage.tsx (там см. константу MAX_PRICE).
const MAX_PRICE = 10000;
// Должно совпадать с PREFIX в ServicesPage.tsx.
const PREFIX = "svc";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const Services = async ({ searchParams }: Props) => {
  const resolvedSearchParams = await searchParams;

  // Должно ЗНАЧЕНИЕ В ЗНАЧЕНИЕ совпадать с тем, как ServicesPage строит свой
  // `filters` из useSearchParams() — иначе ключ запроса тут не совпадёт с
  // клиентским и HydrationBoundary ничего не подхватит. Раньше здесь
  // префетчилось {} без категории/цены — для любой ссылки с ?svc_spec=...
  // или ?svc_price=... префетч был бесполезен, клиент всё равно бил по API
  // заново с реальными фильтрами.
  const rawCategory = resolvedSearchParams?.[`${PREFIX}_spec`];
  const currentCategory = typeof rawCategory === "string" ? rawCategory : null;

  const rawPrice = resolvedSearchParams?.[`${PREFIX}_price`];
  const priceParts =
    typeof rawPrice === "string" ? rawPrice.split("-").map(Number) : undefined;
  const priceRange: [number, number] = [
    priceParts?.[0] ?? 0,
    priceParts?.[1] ?? MAX_PRICE,
  ];

  const filters: Omit<ServiceFilters, "page" | "page_size"> = {
    category: currentCategory ?? undefined,
    min_price: priceParts ? priceRange[0] : undefined,
    max_price: priceParts ? priceRange[1] : undefined,
  };

  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: serviceKeys.list(filters),
    queryFn: () =>
      api.getServicesPaginated({ ...filters, page: 1, page_size: PAGE_SIZE }),
    initialPageParam: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ServicesPage searchParams={resolvedSearchParams} />
    </HydrationBoundary>
  );
};

export default Services;
