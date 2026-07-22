import { notFound } from "next/navigation";

import ConsultationRoom from "@/components/livekit/ConsultationRoom";

export default async function ConsultationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  return <ConsultationRoom consultationId={id} />;
}
