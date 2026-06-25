import { Suspense } from "react";

import dynamic from "next/dynamic";
import Link from "next/link";

import { BlogSectionServer } from "@/widgets/blog-section";
import { Header } from "@/widgets/header";
import { Hero } from "@/widgets/hero";

import {
  VideoThumbnail1,
  VideoThumbnail2,
  VideoThumbnail3,
} from "@/shared/assets/images";
import { ROUTES } from "@/shared/config/routes";

const DoctorsMainList = dynamic(() =>
  import("@/widgets/doctors-main-list").then((mod) => mod.DoctorsMainList),
);
const ClinicsMainList = dynamic(() =>
  import("@/widgets/clinics-main-list").then((mod) => mod.ClinicsMainList),
);
const Banners = dynamic(() =>
  import("@/widgets/banners").then((mod) => mod.Banners),
);
const VideosSwiper = dynamic(() =>
  import("@/widgets/videos-swiper").then((mod) => mod.VideosSwiper),
);
const Footer = dynamic(() =>
  import("@/widgets/footer").then((mod) => mod.Footer),
);
const SpecializationsSection = dynamic(() =>
  import("@/widgets/specializations").then((mod) => mod.SpecializationsSection),
);

export const HomePage = () => {
  return (
    <main>
      <Header searchable />
      <Hero />

      <DoctorsMainList />
      <SpecializationsSection />
      <ClinicsMainList />
      <Banners />

      <div className="max-w-340 mx-auto">
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
      </div>

      <section className="w-full max-w-360 mx-auto px-4 md:px-10 py-8 md:py-12">
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

      <Footer />
    </main>
  );
};
