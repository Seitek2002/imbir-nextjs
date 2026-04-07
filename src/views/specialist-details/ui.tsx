"use client";

import { FC } from "react";

import Link from "next/link";

import { Footer, Header, VideosSwiper } from "@/widgets";

import { ReviewsSection } from "@/widgets/reviews/ui";

import { HeaderBackIcon, HeartIcon } from "@/shared/assets";
import { MOCK_DOCTOR, MOCK_REVIEWS } from "@/shared/constants/mocks";
import { Button, IconBtn } from "@/shared/ui";

type Props = {
  id: string;
};

export const SpecialistDetailsPage: FC<Props> = ({ id }) => {
  console.log(id);

  return (
    <main className="min-h-screen bg-[#F2F3F5] md:bg-white flex flex-col relative pb-20 md:pb-0">
      {/* Десктопный хедер (скрыт на мобилках) */}
      <div className="hidden md:block">
        <Header />
      </div>

      <div className="flex-1 w-full max-w-350 mx-auto md:px-10 flex flex-col pt-0 md:pt-6 pb-10">
        {/* Хлебные крошки (только десктоп) */}
        <div className="hidden md:flex text-sm text-[#686F72] mb-6 items-center gap-2">
          <Link href="/" className="hover:text-[#F5653E] transition-colors">
            Главная
          </Link>
          <span>•</span>
          <Link
            href="/specialists"
            className="hover:text-[#F5653E] transition-colors"
          >
            Специалисты
          </Link>
          <span>•</span>
          <span className="text-[#F5653E]">{MOCK_DOCTOR.name}</span>
        </div>

        {/* --- ОСНОВНОЙ БЛОК: ФОТО + ИНФО --- */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Левая колонка / Мобильный верх: Фото */}
          <div className="relative w-full md:w-100 shrink-0">
            {/* Мобильная шапка поверх фото */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 md:hidden">
              <IconBtn
                variant="outline"
                size="sm"
                className="bg-white/80 backdrop-blur"
                onClick={() => window.history.back()}
              >
                <HeaderBackIcon className="size-4" />
              </IconBtn>
              <IconBtn
                variant="outline"
                size="sm"
                className="bg-white/80 backdrop-blur"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.7002 3.08203C15.98 3.08203 17.8339 4.9391 17.834 7.24023C17.834 8.17748 17.6844 9.04242 17.4248 9.84473L17.4238 9.84766C16.8013 11.8176 15.5246 13.4089 14.1426 14.5967C12.7583 15.7864 11.2961 16.5471 10.3555 16.8672L10.3506 16.8691C10.2791 16.8944 10.1517 16.915 10 16.915C9.84865 16.915 9.72192 16.8943 9.65039 16.8691L9.64453 16.8672L9.26855 16.7266C8.33979 16.3503 7.06963 15.6377 5.8584 14.5967C4.47629 13.4088 3.19968 11.8177 2.57715 9.84766L2.57617 9.84473L2.48438 9.54102C2.28184 8.82512 2.16699 8.06042 2.16699 7.24023C2.16706 4.9391 4.02097 3.08203 6.30078 3.08203C7.64403 3.08218 8.84796 3.73555 9.59961 4.74023L10 5.27539L10.4004 4.74023C11.1521 3.73547 12.3568 3.08207 13.7002 3.08203Z"
                    fill="#FFA18D"
                    stroke="#FFA18D"
                  />
                </svg>
              </IconBtn>
            </div>

            <div className="relative w-full h-85 md:h-125 bg-[#FFEFE5] md:rounded-3xl overflow-hidden">
              {/* Заглушка под фото. Заменишь на <Image src={MOCK_DOCTOR.image} ... /> */}
              <div className="absolute inset-0 flex items-center justify-center text-[#838A8D]">
                Фото {MOCK_DOCTOR.name}
              </div>
            </div>
          </div>

          {/* Правая колонка / Мобильный низ: Информация */}
          <div className="flex-1 flex flex-col rounded-t-3xl md:rounded-none -mt-6 md:mt-0 relative z-10 p-2 md:p-0">
            {/* Имя и специальность */}
            <div className="bg-white rounded-[20px] p-4 border border-[#E3E4E5]">
              <div className="flex justify-center md:justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-semibold text-[#191A1B] mb-1">
                    {MOCK_DOCTOR.name}
                  </h1>
                  <p className="text-[#838A8D] text-center lg:text-left text-base">
                    {MOCK_DOCTOR.specialty}
                  </p>
                </div>
                <IconBtn variant="outline" size="md">
                  <HeartIcon className="size-5" />
                </IconBtn>
              </div>

              {/* Статистика (Оценка, Стаж, Отзывы) */}
              <div className="flex items-center justify-between bg-white border border-[#E3E4E5] rounded-2xl p-4 divide-x divide-[#E3E4E5]">
                <div className="flex flex-col items-center flex-1">
                  <span className="text-base md:text-[20px] font-medium text-[#191A1B]">
                    {MOCK_DOCTOR.rating}
                  </span>
                  <span className="text-sm text-[#838A8D]">Оценка</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <span className="text-base md:text-[20px] font-medium text-[#191A1B]">
                    {MOCK_DOCTOR.experience} лет
                  </span>
                  <span className="text-sm text-[#838A8D]">Стаж</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <span className="text-base md:text-[20px] font-medium text-[#191A1B]">
                    {MOCK_DOCTOR.reviewsCount}
                  </span>
                  <span className="text-sm text-[#838A8D]">Отзывов</span>
                </div>
              </div>
            </div>

            {/* Десктопные кнопки */}
            <div className="hidden md:flex gap-4 mb-10 mt-4">
              <Button
                variant="outline"
                className="flex-1 justify-center bg-[#FFF2F0] border-transparent text-[#F5653E]"
              >
                Онлайн-консультация
              </Button>
              <Button className="flex-1 justify-center">
                Офлайн-консультация
              </Button>
            </div>

            {/* ТУТ БУДУТ БЛОКИ ДЕТАЛЕЙ (Образование, Опыт и т.д.) */}
            <div className="flex flex-col gap-2 md:gap-10 md:border-none pt-8 md:pt-0">
              {/* 1. Образование */}
              <div className="bg-white rounded-[20px] p-4 border border-[#E3E4E5]">
                <h3 className="text-lg font-semibold text-[#191A1B] mb-3">
                  Образование
                </h3>
                <p className="text-[#838A8D] text-sm md:text-base leading-relaxed">
                  {MOCK_DOCTOR.education}
                </p>
              </div>

              {/* 2. О враче */}
              <div className="bg-white rounded-[20px] p-4 border border-[#E3E4E5]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-[#191A1B]">
                    О враче
                  </h3>
                  <button className="text-[#F5653E] text-sm hover:underline transition-colors">
                    Подробнее
                  </button>
                </div>
                <p className="text-[#838A8D] text-sm md:text-base leading-relaxed">
                  {MOCK_DOCTOR.about}
                </p>
              </div>

              {/* 3. Опыт работы */}
              <div className="bg-white rounded-[20px] p-4 border border-[#E3E4E5]">
                <h3 className="text-lg font-semibold text-[#191A1B] mb-4">
                  Опыт работы
                </h3>
                <div className="flex flex-col gap-5">
                  {MOCK_DOCTOR.workExperience.map((exp, idx) => (
                    <div key={idx} className="relative pl-5">
                      {/* Оранжевое тире (декорация) */}
                      <span className="absolute left-0 top-2.5 w-2.5 h-0.5 bg-[#F5653E]" />

                      <div className="mb-1">
                        <span className="text-[#191A1B] font-medium text-sm md:text-base">
                          {exp.years}{" "}
                        </span>
                        <span className="text-[#F5653E] text-sm md:text-base">
                          {exp.duration}
                        </span>
                      </div>
                      <p className="text-[#191A1B] text-sm md:text-base">
                        {exp.place}
                      </p>
                      <p className="text-[#838A8D] text-sm md:text-base">
                        {exp.role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Профессиональные навыки */}
              <div className="bg-white rounded-[20px] p-4 border border-[#E3E4E5]">
                <h3 className="text-lg font-semibold text-[#191A1B] mb-4">
                  Профессиональные навыки
                </h3>
                <ul className="flex flex-col gap-3">
                  {MOCK_DOCTOR.skills.map((skill, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {/* Оранжевое тире для списка */}
                      <span className="text-[#F5653E] font-medium text-lg leading-none mt-0.5">
                        —
                      </span>
                      <span className="text-[#838A8D] text-sm md:text-base leading-relaxed">
                        {skill}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 5. Контакты */}
              <div className="bg-white rounded-[20px] p-4 border border-[#E3E4E5]">
                <h3 className="text-lg font-semibold text-[#191A1B] mb-4">
                  Контакты
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-5 text-[#F5653E]">
                      🕒
                    </div>
                    <span className="text-[#838A8D] text-sm md:text-base">
                      {MOCK_DOCTOR.contacts.schedule}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-5 text-[#F5653E]">
                      📞
                    </div>
                    <span className="text-[#838A8D] text-sm md:text-base">
                      {MOCK_DOCTOR.contacts.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center size-5 text-[#F5653E]">
                      ✉️
                    </div>
                    <span className="text-[#838A8D] text-sm md:text-base">
                      {MOCK_DOCTOR.contacts.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- СЕКЦИЯ: ОТЗЫВЫ --- */}
        <ReviewsSection
          initialReviews={MOCK_REVIEWS}
          averageRating={MOCK_DOCTOR.rating}
        />

        {/* --- СЕКЦИЯ ИНТЕРВЬЮ --- */}
        <div className="mt-10 md:mt-20 mb-10 md:mb-20 px-4 md:px-0">
          <div className="flex items-center justify-between mb-6 md:mb-8 md:hidden">
            <h2 className="text-2xl font-semibold text-[#191A1B]">Интервью</h2>
            <Link
              href="/videos"
              className="text-[#F5653E] text-sm font-medium hover:underline"
            >
              Все
            </Link>
          </div>

          <VideosSwiper
            title="Интервью"
            viewAllHref="/videos"
            description="Ознакомьтесь с интересными материалами"
            videos={[
              {
                id: "1",
                title: "Врач онлайн: как это работает за 1 минуту",
                authorName: MOCK_DOCTOR.name,
                authorRole: MOCK_DOCTOR.specialty,
                thumbnail: MOCK_DOCTOR.image.src,
                youtubeUrl: "#",
              },
              {
                id: "2",
                title: "3 шага к консультации с врачом",
                authorName: MOCK_DOCTOR.name,
                authorRole: MOCK_DOCTOR.specialty,
                thumbnail: MOCK_DOCTOR.image.src,
                youtubeUrl: "#",
              },
            ]}
          />
        </div>
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Мобильная липкая кнопка внизу */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-[#E3E4E5] z-50">
        <Button className="w-full justify-center" size="lg">
          Записаться на приём
        </Button>
      </div>
    </main>
  );
};
