import {
  Banners,
  ClinicsMainList,
  DoctorsMainList,
  Footer,
  Header,
  Hero,
  VideosSwiper,
} from "@/widgets";

import {
  VideoThumbnail1,
  VideoThumbnail2,
  VideoThumbnail3,
} from "@/shared/assets";

2;

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
              title: "3 шага к консультации с врачом",
              authorName: "Садыкова А. Т.",
              authorRole: "Врач-терапевт",
              thumbnail: VideoThumbnail2.src,
              youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
            {
              id: "3",
              title: "Медицина без очередей — попробуйте сами",
              authorName: "Садыкова А. Т.",
              authorRole: "Врач-терапевт",
              thumbnail: VideoThumbnail3.src,
              youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
            {
              id: "4",
              title: "Как правильно ухаживать за полостью рта",
              authorName: "Осмонов К. Д.",
              authorRole: "Врач-стоматолог",
              thumbnail: VideoThumbnail1.src,
              youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
            {
              id: "5",
              title: "Профилактика сердечно-сосудистых заболеваний",
              authorName: "Исаева Б. М.",
              authorRole: "Врач-кардиолог",
              thumbnail: VideoThumbnail2.src,
              youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
            {
              id: "6",
              title: "Всё, что нужно знать о лазерной коррекции зрения",
              authorName: "Тимуров А. С.",
              authorRole: "Врач-офтальмолог",
              thumbnail: VideoThumbnail3.src,
              youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
            {
              id: "7",
              title: "Детский иммунитет: советы родителям на осень",
              authorName: "Жунусова Э. К.",
              authorRole: "Врач-педиатр",
              thumbnail: VideoThumbnail1.src,
              youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
          ]}
        />
      </div>
      <Footer />
    </main>
  );
};
