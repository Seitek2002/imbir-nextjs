import { SearchPage } from "@/views/search";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;

  return <SearchPage searchParams={resolvedSearchParams} />;
}
