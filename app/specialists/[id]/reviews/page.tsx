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
      targetType="doctor"
      targetId={id}
      backHref={ROUTES.SPECIALIST_DETAILS(id)}
    />
  );
}
