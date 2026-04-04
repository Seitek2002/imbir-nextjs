import {
  ClinicsSwiper,
  DoctorsMainList,
  Header,
  Hero,
  VideosSwiper,
} from "@/widgets";

import {
  ClinicImage1,
  ClinicImage2,
  ClinicImage3,
  ClinicImage4,
  VideoThumbnail1,
  VideoThumbnail2,
  VideoThumbnail3,
} from "@/shared/assets";

export const HomePage = () => {
  return (
    <main>
      <Header searchable />
      <Hero />
      <DoctorsMainList />
      <div className="max-w-340 mx-auto">
        <ClinicsSwiper
          title="Клиники"
          viewAllHref="/clinics"
          description="Выберите интересующие вас параметры, чтобы ознакомиться с подходящими клиниками"
          city="г. Бишкек"
          district="Ленинский район"
          clinics={[
            {
              id: "1",
              name: "Nova Clinic",
              rating: 4.85,
              reviews: 255,
              experience: 12,
              address: "ул. Московская, 189",
              image: ClinicImage1.src,
              specialty: "cardiology",
            },
            {
              id: "2",
              name: "K-MED",
              rating: 4.85,
              reviews: 255,
              experience: 12,
              address: "ул. Московская, 189",
              image: ClinicImage2.src,
              specialty: "dentistry",
            },
            {
              id: "3",
              name: "Med Center",
              rating: 4.85,
              reviews: 255,
              experience: 12,
              address: "ул. Московская, 189",
              image: ClinicImage3.src,
              specialty: "neurology",
            },
            {
              id: "4",
              name: "Nova Clinic",
              rating: 4.85,
              reviews: 255,
              experience: 12,
              address: "ул. Московская, 189",
              image: ClinicImage4.src,
              specialty: "cardiology",
            },
          ]}
        />
      </div>
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
          ]}
        />
      </div>
    </main>
  );
};
