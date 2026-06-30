import { ClinicDetailsPage } from "@/screens/clinic/clinic-details";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  return <ClinicDetailsPage id={resolvedParams.id} />;
}
