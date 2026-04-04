import { SearchPage } from "@/views/search";

export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return <SearchPage searchParams={searchParams} />;
}
