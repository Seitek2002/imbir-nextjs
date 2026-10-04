import { SpecialistDetailsPage } from "@/pages/specialist-details";

import { api } from "@/shared/api";

// Страница врача одинакова для всех посетителей (избранное, «мой отзыв» и
// прочее личное клиент дочитывает сам), поэтому её можно кешировать. Без
// generateStaticParams Next рендерит маршрут с [id] заново на каждый запрос и
// каждый раз ждёт ответа бэка; с пустым списком страница собирается при
// первом обращении и дальше отдаётся из кеша мгновенно, а обновляется в фоне
// не чаще раза в минуту.
export const revalidate = 60;
export const generateStaticParams = async () => [];

// Данные и момент их получения — парой. Страница из кеша может быть старше
// своих данных: по этой отметке React Query понимает их возраст и сам тихо
// перезапрашивает устаревшие. Вынесено из компонента, потому что Date.now()
// в теле рендера запрещает линтер (react-hooks/purity).
const loadDoctor = async (id: string) => {
  // См. app/clinics/[id]/page.tsx — тот же приём: фетчим на сервере и
  // отдаём как initialData, чтобы клиент не показывал свой собственный
  // текст "Загрузка специалиста..." поверх уже отрисованного skeleton'а.
  const doctor = await api.getDoctorById(id).catch(() => undefined);

  return { doctor, fetchedAt: Date.now() };
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { doctor, fetchedAt } = await loadDoctor(resolvedParams.id);

  return (
    <SpecialistDetailsPage
      id={resolvedParams.id}
      initialDoctor={doctor}
      initialDoctorUpdatedAt={fetchedAt}
    />
  );
}
