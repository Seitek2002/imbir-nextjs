import { Suspense } from "react";

import dynamic from "next/dynamic";
import Link from "next/link";

import { BlogSectionServer } from "@/widgets/blog-section";
import { Header } from "@/widgets/header";

import {
  VideoThumbnail1,
  VideoThumbnail2,
  VideoThumbnail3,
} from "@/shared/assets/images";
import { ROUTES } from "@/shared/config";
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

export const HomePage = () => {
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

      <LazyInView minHeight={440}>
        <Banners />
      </LazyInView>

      <LazyInView minHeight={380} className="w-full">
        <VideosSwiper
          title="Интервью"
          viewAllHref="/videos"
          description="Ознакомьтесь с интервью наших специалистов"
          videos={[
            {
              id: "1",
              title: "3 шага к консультации с врачом",
              authorName: "Садыкова А. Т.",
              authorRole: "Врач-терапевт",
              thumbnail: VideoThumbnail1.src,
              youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
            {
              id: "2",
              title: "Врач онлайн: как это работает за 1 минуту",
              authorName: "Садыкова А. Т.",
              authorRole: "Врач-терапевт",
              thumbnail: VideoThumbnail2.src,
              youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
            {
              id: "3",
              title: "Врач онлайн: как это работает за 1 минуту",
              authorName: "Садыкова А. Т.",
              authorRole: "Врач-терапевт",
              thumbnail: VideoThumbnail3.src,
              youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
          ]}
        />
      </LazyInView>

      <section className="w-full max-w-360 mx-auto px-4 md:px-10 pt-8 pb-0 md:py-12">
        <div className="flex items-start justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-2xl md:text-[32px] font-bold text-foreground leading-tight">
              Блог
            </h2>
            <p className="hidden md:block text-muted text-base mt-1">
              Статьи о здоровье, советы специалистов и новости медицины
            </p>
          </div>
          <Link
            href={ROUTES.BLOG}
            className="md:hidden text-primary text-sm font-medium mt-1"
          >
            Все
          </Link>
        </div>
        <Suspense fallback={null}>
          <BlogSectionServer />
        </Suspense>
      </section>

      <LazyInView minHeight={300}>
        <Footer />
      </LazyInView>
    </main>
  );
};
