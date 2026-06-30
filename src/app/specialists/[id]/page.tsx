import { SpecialistDetailsPage } from "@/screens/specialist-details";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  return <SpecialistDetailsPage id={resolvedParams.id} />;
}
