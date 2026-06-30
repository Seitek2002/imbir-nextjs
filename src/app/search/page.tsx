import { SearchPage } from "@/screens/search";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  return <SearchPage searchParams={resolvedSearchParams} />;
}
