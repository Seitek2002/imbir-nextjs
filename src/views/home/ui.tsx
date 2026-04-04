import { FilterBar } from "@/features";
import { ClinicsSwiper, Header, Hero, VideosSwiper } from "@/widgets";

import { DoctorCard } from "@/entities/doctor";

import {
  ClinicImage1,
  ClinicImage2,
  ClinicImage3,
  ClinicImage4,
  DoctorImage1,
  DoctorImage2,
  DoctorImage3,
  VideoThumbnail1,
  VideoThumbnail2,
  VideoThumbnail3,
} from "@/shared/assets";

export const HomePage = () => {
  return (
    <main>
      <Header searchable />
      <Hero />
      <FilterBar />
      <div className="px-4 py-6 flex flex-col gap-3 max-w-[1360px] mx-auto">
        <h2 className="font-semibold text-lg text-[#191A1B]">Врачи</h2>

        {/* Мобильный: вертикальный список */}
        <div className="flex flex-col gap-2 md:hidden">
          <DoctorCard
            name="Айбеков Н. Э."
            specialty="Врач-терапевт"
            clinic="Nova Clinic"
            rating={4.85}
            reviews={255}
            experience={12}
            image={DoctorImage1}
            variant="horizontal"
          />
          <DoctorCard
            name="Иванова Мария Сергеевна"
            specialty="Врач-терапевт"
            clinic="Nova Clinic"
            rating={4.85}
            reviews={255}
            experience={12}
            image={DoctorImage2}
            variant="horizontal"
          />
          <DoctorCard
            name="Джумабеков Д. Р."
            specialty="Врач-терапевт"
            clinic="Nova Clinic"
            rating={4.85}
            reviews={255}
            experience={12}
            image={DoctorImage3}
            variant="horizontal"
          />
        </div>

        {/* Десктоп: грид 4 колонки */}
        <div className="hidden md:grid md:grid-cols-4 gap-3">
          <DoctorCard
            name="Айбеков Нурлан Эльдарович"
            specialty="Врач-терапевт"
            clinic="Nova Clinic"
            rating={4.85}
            reviews={255}
            experience={12}
            image={DoctorImage1}
          />
          <DoctorCard
            name="Иванова Мария Сергеевна"
            specialty="Кардиолог"
            clinic="MedCity"
            rating={4.72}
            reviews={130}
            experience={8}
            image={DoctorImage2}
          />
          <DoctorCard
            name="Очень Длинное Имя Врача Которое Не Помещается"
            specialty="Невролог"
            clinic="HealthPlus"
            rating={4.9}
            reviews={87}
            experience={15}
          />
          <DoctorCard
            name="Джумабеков Адилет"
            specialty="Хирург"
            clinic="BioMed"
            rating={4.6}
            reviews={210}
            experience={20}
            image={DoctorImage3}
            initialSaved
          />
        </div>
      </div>
      <div className="max-w-[1360px] mx-auto">
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
      <div className="max-w-[1360px] mx-auto">
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
