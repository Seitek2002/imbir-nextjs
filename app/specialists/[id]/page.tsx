import { SpecialistDetailsPage } from "@/pages/specialist-details";

import { api } from "@/shared/api";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  // См. app/clinics/[id]/page.tsx — тот же приём: фетчим на сервере и
  // отдаём как initialData, чтобы клиент не показывал свой собственный
  // текст "Загрузка специалиста..." поверх уже отрисованного skeleton'а.
  const initialDoctor = await api
    .getDoctorById(resolvedParams.id)
    .catch(() => undefined);

  return (
    <SpecialistDetailsPage
      id={resolvedParams.id}
      initialDoctor={initialDoctor}
    />
  );
}
