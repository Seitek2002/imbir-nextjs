import { Suspense } from "react";

import dynamic from "next/dynamic";

import { BlogSectionServer } from "@/widgets/blog-section";
import { Header } from "@/widgets/header";

import { fetchInterviews } from "@/entities/interview";

import { LazyInView } from "@/shared/ui";

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

export const HomePage = async () => {
  const interviews = await fetchInterviews(6);

  return (
    <main className="pb-16 lg:pb-0">
      <Header searchable />
      <Hero />

      {/* First content block: kept eager-ish (mounts as the hero scrolls). */}
      <DoctorsMainList />
      <SpecializationsSection />

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
