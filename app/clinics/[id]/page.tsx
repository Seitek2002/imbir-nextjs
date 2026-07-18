import { ClinicDetailsPage } from "@/pages/clinic/clinic-details";

import { api } from "@/shared/api";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  // Клиент грузит эти же данные через useQuery, но фетч на клиенте начинается
  // только после гидратации — до этого страница показывает свой собственный
  // текст "Загрузка клиники..." поверх уже отрисованного skeleton'а из
  // loading.tsx. Получая данные здесь и передавая их как initialData,
  // избегаем этой лишней клиентской фазы загрузки на первом рендере.
  // При ошибке (клиника не найдена и т.п.) просто отдаём undefined — клиент
  // повторит запрос сам и покажет свой обычный экран "не найдено".
  const initialClinic = await api
    .getClinicById(resolvedParams.id)
    .catch(() => undefined);

  return (
    <ClinicDetailsPage id={resolvedParams.id} initialClinic={initialClinic} />
  );
}
