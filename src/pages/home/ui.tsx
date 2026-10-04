import { Suspense } from "react";

import dynamic from "next/dynamic";

import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { BlogSectionServer } from "@/widgets/blog-section";
import { Header } from "@/widgets/header";

import { fetchInterviews } from "@/entities/interview";

import {
  api,
  doctorKeys,
  getSpecializations,
  referenceKeys,
} from "@/shared/api";
import { DEFAULT_CITY } from "@/shared/store";
import { LazyInView } from "@/shared/ui";

import { HOME_DOCTORS_COUNT } from "./config";
// Эти два блока рендерятся сразу (не за LazyInView, см. ниже), поэтому им не
// нужен свой отдельный async-чанк — dynamic() тут только добавлял лишний
// round-trip и дублировал общие зависимости (напр. tailwind-merge) в чанк
// каждого компонента вместо одного общего бандла страницы. Компоненты ниже,
// что реально отложены через LazyInView, оставлены динамическими — там
// code-splitting настоящий, не косметический.
import { DoctorsMainList } from "./doctorsMainList";
import { Hero } from "./hero";
import { SpecializationsSection } from "./specializations";

const ClinicsList = dynamic(() =>
  import("./clinicsList").then((mod) => mod.ClinicsMainList),
);
const Banners = dynamic(() => import("./banners").then((mod) => mod.Banners));
const VideosSwiper = dynamic(() =>
  import("@/widgets/videos-swiper").then((mod) => mod.VideosSwiper),
);
const Footer = dynamic(() =>
  import("@/widgets/footer").then((mod) => mod.Footer),
);

// Запрос списка врачей, с которого стартует блок «Специалисты»: город по
// умолчанию, фильтров нет. Значения обязаны совпадать с тем, что
// DoctorsListContent соберёт на первом рендере, иначе ключ запроса разойдётся
// с клиентским и префетч не подхватится.
const HOME_DOCTORS_FILTERS = {
  city: DEFAULT_CITY,
  page_size: HOME_DOCTORS_COUNT,
};

export const HomePage = async () => {
  // Первый экран с данными собираем на сервере. Раньше врачи и специализации
  // запрашивались только из браузера: в HTML уезжали скелетоны, а настоящие
  // карточки появлялись после загрузки JS, гидратации и ещё одного захода в
  // API — на телефоне это секунды. Теперь карточки приходят уже в HTML, а
  // страница остаётся статикой (ISR): запросы ниже выполняются при сборке и
  // фоновом обновлении, а не на каждое открытие.
  //
  // prefetchQuery ошибок не бросает: если бэк не ответил, запрос просто не
  // попадёт в dehydrate, и клиент сходит за данными сам — как раньше.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const [interviews] = await Promise.all([
    fetchInterviews(6),
    queryClient.prefetchQuery({
      queryKey: doctorKeys.list(HOME_DOCTORS_FILTERS),
      queryFn: () => api.getDoctors(HOME_DOCTORS_FILTERS),
    }),
    // Плитки специализаций (SpecializationsSection).
    queryClient.prefetchQuery({
      queryKey: referenceKeys.specializations("all"),
      queryFn: () => getSpecializations("all"),
    }),
    // Список в фильтре «Специализация» над врачами (FilterBar).
    queryClient.prefetchQuery({
      queryKey: referenceKeys.specializations("doctor"),
      queryFn: () => getSpecializations("doctor"),
    }),
  ]);

  return (
    <main className="pb-16 lg:pb-0">
      <Header searchable />
      <Hero />

      {/* First content block: kept eager-ish (mounts as the hero scrolls). */}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DoctorsMainList />
        <SpecializationsSection />
      </HydrationBoundary>

      {/* Below-the-fold client widgets — mount only when scrolled near, so their
          hydration (incl. Swiper carousels) doesn't block the initial load.
          minHeight reserves space to keep CLS at 0. */}
      <LazyInView minHeight={520}>
        <ClinicsList />
      </LazyInView>

      <LazyInView minHeight={228}>
        <Banners />
      </LazyInView>

      {interviews.length > 0 && (
        <LazyInView minHeight={320} className="w-full">
          <VideosSwiper
            title="Интервью"
            viewAllHref="/videos"
            description="Ознакомьтесь с интервью наших специалистов"
            videos={interviews}
          />
        </LazyInView>
      )}

      {/* Заголовок, описание и ссылка «Все» рендерятся внутри
          BlogSectionServer вместе с самим блоком — так весь блог целиком
          скрывается, если статей нет, а не остаётся пустой секцией с
          заголовком без содержимого. */}
      <Suspense fallback={null}>
        <BlogSectionServer variant="home" prioritizeFirstCard />
      </Suspense>

      <LazyInView minHeight={300}>
        <Footer />
      </LazyInView>
    </main>
  );
};
