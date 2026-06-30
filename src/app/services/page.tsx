import { ServicesPage } from "@/screens/services";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const Services = async ({ searchParams }: Props) => {
  const resolvedSearchParams = await searchParams;

  return <ServicesPage searchParams={resolvedSearchParams} />;
};

export default Services;
