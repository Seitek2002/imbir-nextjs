import { AllReviewsPage } from "@/pages/reviews-all";

import { ROUTES } from "@/shared/config";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AllReviewsPage
      targetType="clinic"
      targetId={id}
      backHref={ROUTES.CLINIC_DETAILS(id)}
    />
  );
}
