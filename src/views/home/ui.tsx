import dynamic from "next/dynamic";

import { Header, Hero } from "@/widgets";

import {
  VideoThumbnail1,
  VideoThumbnail2,
  VideoThumbnail3,
} from "@/shared/assets";

const DoctorsMainList = dynamic(() =>
  import("@/widgets").then((mod) => mod.DoctorsMainList),
);
const ClinicsMainList = dynamic(() =>
  import("@/widgets").then((mod) => mod.ClinicsMainList),
);
const Banners = dynamic(() => import("@/widgets").then((mod) => mod.Banners));
const VideosSwiper = dynamic(() =>
  import("@/widgets").then((mod) => mod.VideosSwiper),
);
const Footer = dynamic(() => import("@/widgets").then((mod) => mod.Footer));

export const HomePage = () => {
  return (
    <main>
      <Header searchable />
      <Hero />

      <DoctorsMainList />
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
              title: "Врач онлайн: как это работает за 1 минуту",
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
      <Footer />
    </main>
  );
};
