import { SpecialistsPage } from "@/screens/specialists";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const Specialists = async ({ searchParams }: Props) => {
  const resolvedSearchParams = await searchParams;

  return <SpecialistsPage searchParams={resolvedSearchParams} />;
};

export default Specialists;
