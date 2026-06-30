import { ClinicsPage } from "@/screens/clinic/clinics";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  return <ClinicsPage searchParams={resolvedSearchParams} />;
}
