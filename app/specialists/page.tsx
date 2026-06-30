import { SpecialistsPage } from "@/pages/specialists";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Not SSR-prefetched: the doctors query is keyed by the user's city, which lives
// in a client (localStorage) store the server can't read. Prefetching the
// default city would cause a hydration mismatch for non-default-city users.
// To SSR this, move the city into a cookie first, then prefetch by that.
const Specialists = async ({ searchParams }: Props) => {
  const resolvedSearchParams = await searchParams;

  return <SpecialistsPage searchParams={resolvedSearchParams} />;
};

export default Specialists;
