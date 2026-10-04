import { ClinicDetailsPage } from "@/pages/clinic/clinic-details";

import { api } from "@/shared/api";

// См. app/specialists/[id]/page.tsx — тот же приём: страница клиники общая
// для всех, поэтому собирается при первом обращении, отдаётся из кеша и
// обновляется в фоне не чаще раза в минуту.
export const revalidate = 60;
export const generateStaticParams = async () => [];

// Данные вместе с моментом их получения — см. loadDoctor в
// app/specialists/[id]/page.tsx.
const loadClinic = async (id: string) => {
  // Клиент грузит эти же данные через useQuery, но фетч на клиенте начинается
  // только после гидратации — до этого страница показывает свой собственный
  // текст "Загрузка клиники..." поверх уже отрисованного skeleton'а из
  // loading.tsx. Получая данные здесь и передавая их как initialData,
  // избегаем этой лишней клиентской фазы загрузки на первом рендере.
  // При ошибке (клиника не найдена и т.п.) просто отдаём undefined — клиент
  // повторит запрос сам и покажет свой обычный экран "не найдено".
  const clinic = await api.getClinicById(id).catch(() => undefined);

  return { clinic, fetchedAt: Date.now() };
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { clinic, fetchedAt } = await loadClinic(resolvedParams.id);

  return (
    <ClinicDetailsPage
      id={resolvedParams.id}
      initialClinic={clinic}
      initialClinicUpdatedAt={fetchedAt}
    />
  );
}
