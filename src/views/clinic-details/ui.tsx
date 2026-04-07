"use client";

import { FC, useState } from "react";

import Link from "next/link";

import { Footer, Header } from "@/widgets";

import { ChatIcon, HeaderBackIcon, HeartIcon, StarIcon } from "@/shared/assets";
import { cn } from "@/shared/lib/utils";
import { Button, IconBtn } from "@/shared/ui";

type Props = {
  id: string;
};

// --- МОКОВЫЕ ДАННЫЕ ---
const MOCK_CLINIC = {
  id: "1",
  name: "MED Clinic",
  type: "Многопрофильная клиника",
  address: "ул. Московская, 189",
  schedule: "ПН-ПТ • 08:00-17:00",
  rating: 4.85,
  experience: 12,
  reviewsCount: 255,
  images: [
    "/placeholder-1.jpg",
    "/placeholder-2.jpg",
    "/placeholder-3.jpg",
    "/placeholder-4.jpg",
  ],
  about:
    "Наша клиника — это современная медицинская помощь, опытные врачи и индивидуальный подход к каждому пациенту. Мы используем проверенные методы и технологии для того, чтобы обеспечить точную диагностику, эффективное лечение и комфорт на каждом этапе.",
  contacts: {
    schedule: "ПН-ПТ • 08:00-17:00",
    address: "ул. Московская, 189",
    phone: "+996 700 123 456",
    email: "dr.sadykova@gmail.com",
  },
};

const MOCK_SERVICES = [
  {
    id: 1,
    name: "Анализ крови",
    category: "Медицина • MED Clinic",
    price: "1700 c",
    rating: 4.85,
    reviews: 255,
  },
  {
    id: 2,
    name: "Аудиометрия",
    category: "Медицина • MED Clinic",
    price: "1700 c",
    rating: 4.85,
    reviews: 255,
  },
  {
    id: 3,
    name: "Биопсия",
    category: "Хирургия • MED Clinic",
    price: "1700 c",
    rating: 4.85,
    reviews: 255,
  },
  {
    id: 4,
    name: "УЗИ",
    category: "УЗИ • MED Clinic",
    price: "1700 c",
    rating: 4.85,
    reviews: 255,
  },
];

const MOCK_SPECIALISTS = [
  {
    id: 1,
    name: "Айбеков Нурлан",
    specialty: "Врач-терапевт • MED Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
  },
  {
    id: 2,
    name: "Садыкова Алина",
    specialty: "Врач-терапевт • MED Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
  },
  {
    id: 3,
    name: "Жумабаев Данияр",
    specialty: "Врач-терапевт • MED Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
  },
  {
    id: 4,
    name: "Калиева Айгерим",
    specialty: "Врач-терапевт • MED Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
  },
];

const MOCK_REVIEWS = [
  {
    id: 1,
    author: "Нуркыз Сабырбекова",
    date: "23 Ноября, 2025",
    text: "Алина Тимуровна замечательный, добрый и очень тщательный врач...",
    rating: 5,
  },
  {
    id: 2,
    author: "Данияр Джумашов",
    date: "23 Ноября, 2025",
    text: "Алина Тимуровна замечательный, добрый и очень тщательный врач...",
    rating: 5,
  },
];

export const ClinicDetailsPage: FC<Props> = ({ id }) => {
  console.log("Clinic ID:", id);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  return (
    <main className="min-h-screen bg-[#F2F3F5] md:bg-white flex flex-col relative pb-20 md:pb-0">
      <div className="hidden md:block">
        <Header />
      </div>

      <div className="flex-1 w-full max-w-350 mx-auto md:px-10 flex flex-col pt-0 md:pt-6 pb-10">
        {/* --- ХЛЕБНЫЕ КРОШКИ (ПК) --- */}
        <div className="hidden md:flex text-sm text-[#686F72] mb-6 items-center gap-2">
          <Link href="/" className="hover:text-[#F5653E] transition-colors">
            Главная
          </Link>
          <span>•</span>
          <Link
            href="/clinics"
            className="hover:text-[#F5653E] transition-colors"
          >
            Клиники
          </Link>
          <span>•</span>
          <span className="text-[#F5653E]">{MOCK_CLINIC.name}</span>
        </div>

        {/* --- ОСНОВНОЙ БЛОК --- */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* ЛЕВАЯ КОЛОНКА: СЛАЙДЕР/ГАЛЕРЕЯ */}
          <div className="relative w-full md:w-125 lg:w-150 shrink-0">
            {/* Шапка для мобилки */}
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

            {/* Слайдер */}
            <div className="flex flex-col gap-4">
              <div className="relative flex overflow-x-auto md:overflow-hidden snap-x snap-mandatory scrollbar-hide h-85 md:h-100 w-full md:rounded-3xl bg-[#E3E4E5]">
                <div className="hidden md:flex absolute inset-0 items-center justify-center text-[#838A8D]">
                  Большое фото {activeImageIdx + 1}
                </div>

                {MOCK_CLINIC.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="md:hidden shrink-0 w-full h-full snap-center flex items-center justify-center text-[#838A8D] border-r border-white/20"
                  >
                    Фото {idx + 1}
                  </div>
                ))}
              </div>

              {/* Миниатюры для ПК */}
              <div className="hidden md:flex gap-3 overflow-x-auto scrollbar-hide">
                {MOCK_CLINIC.images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={cn(
                      "size-20 lg:size-24 rounded-2xl bg-[#E3E4E5] shrink-0 cursor-pointer transition-all flex items-center justify-center text-xs text-[#838A8D]",
                      activeImageIdx === idx
                        ? "border-2 border-[#F5653E]"
                        : "border-2 border-transparent hover:border-[#F5653E]/50",
                    )}
                  >
                    Мини {idx + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА: ИНФОРМАЦИЯ О КЛИНИКЕ */}
          <div className="flex-1 flex flex-col rounded-t-3xl md:rounded-none -mt-6 md:mt-0 relative z-10 p-2 md:p-0">
            {/* Заголовок */}
            <div className="bg-white rounded-[20px] p-4 border border-[#E3E4E5]">
              <div className="flex justify-center md:justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-semibold text-[#191A1B] mb-1">
                    {MOCK_CLINIC.name}
                  </h1>
                  <p className="text-[#838A8D] text-center lg:text-left text-base mb-4">
                    {MOCK_CLINIC.type}
                  </p>

                  {/* Адрес и время работы (под заголовком) */}
                  <div className="flex flex-col gap-1.5 text-sm text-[#191A1B]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#F5653E]">📍</span>{" "}
                      {MOCK_CLINIC.address}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#F5653E]">🕒</span>{" "}
                      {MOCK_CLINIC.schedule}
                    </div>
                  </div>
                </div>
                <IconBtn variant="outline" size="md">
                  <HeartIcon className="size-5" />
                </IconBtn>
              </div>

              {/* Статистика */}
              <div className="flex items-center justify-between bg-white border border-[#E3E4E5] rounded-2xl p-4 divide-x divide-[#E3E4E5]">
                <div className="flex flex-col items-center flex-1">
                  <span className="text-base md:text-[20px] font-medium text-[#191A1B]">
                    {MOCK_CLINIC.rating}
                  </span>
                  <span className="text-sm text-[#838A8D]">Оценка</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <span className="text-base md:text-[20px] font-medium text-[#191A1B]">
                    {MOCK_CLINIC.experience} лет
                  </span>
                  <span className="text-sm text-[#838A8D]">Опыт</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <span className="text-base md:text-[20px] font-medium text-[#191A1B]">
                    {MOCK_CLINIC.reviewsCount}
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
                Офлайн-консультация
              </Button>
              <Button className="flex-1 justify-center">
                Онлайн-консультация
              </Button>
            </div>

            {/* Детали */}
            <div className="flex flex-col gap-2 md:gap-10 md:border-none pt-8 md:pt-0">
              {/* О клинике */}
              <div className="bg-white rounded-[20px] p-4 border border-[#E3E4E5]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-[#191A1B]">
                    О клинике
                  </h3>
                  <button className="text-[#F5653E] text-sm hover:underline transition-colors">
                    Подробнее
                  </button>
                </div>
                <p className="text-[#838A8D] text-sm md:text-base leading-relaxed">
                  {MOCK_CLINIC.about}
                </p>
              </div>

              {/* Контакты */}
              <div className="bg-white rounded-[20px] p-4 border border-[#E3E4E5]">
                <h3 className="text-lg font-semibold text-[#191A1B] mb-4">
                  Контакты
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[#F5653E]">🕒</span>
                    <span className="text-[#838A8D] text-sm md:text-base">
                      {MOCK_CLINIC.contacts.schedule}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#F5653E]">📍</span>
                    <span className="text-[#838A8D] text-sm md:text-base">
                      {MOCK_CLINIC.contacts.address}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#F5653E]">📞</span>
                    <span className="text-[#838A8D] text-sm md:text-base">
                      {MOCK_CLINIC.contacts.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#F5653E]">✉️</span>
                    <span className="text-[#838A8D] text-sm md:text-base">
                      {MOCK_CLINIC.contacts.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- СЕКЦИЯ: УСЛУГИ --- */}
        <div className="mt-10 md:mt-20 px-4 md:px-0">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-2xl font-semibold text-[#191A1B]">Услуги</h2>
            <div className="hidden md:flex bg-white border border-[#E3E4E5] rounded-full px-4 py-2 w-75">
              <span className="text-[#838A8D] text-sm">🔍 Поиск...</span>
            </div>
            <Link
              href="#"
              className="md:hidden text-[#F5653E] text-sm font-medium hover:underline"
            >
              Все
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {MOCK_SERVICES.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-[#E3E4E5] rounded-2xl p-4 flex flex-col"
              >
                <div className="h-32 bg-[#E3E4E5] rounded-xl mb-4 flex items-center justify-center text-xs text-gray-400">
                  Фото услуги
                </div>
                <h4 className="font-semibold text-[#191A1B]">{service.name}</h4>
                <p className="text-xs text-[#838A8D] mb-2">
                  {service.category}
                </p>
                <div className="flex items-center justify-between mt-auto mb-4">
                  <span className="font-bold text-[#191A1B]">
                    {service.price}
                  </span>
                  <span className="text-xs text-[#838A8D]">
                    ⭐ {service.rating} ({service.reviews})
                  </span>
                </div>
                <Button variant="outline" className="w-full justify-center">
                  Записаться
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* --- СЕКЦИЯ: СПЕЦИАЛИСТЫ --- */}
        <div className="mt-10 md:mt-20 px-4 md:px-0">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-2xl font-semibold text-[#191A1B]">
              Специалисты
            </h2>
            <div className="hidden md:flex bg-white border border-[#E3E4E5] rounded-full px-4 py-2 w-75">
              <span className="text-[#838A8D] text-sm">🔍 Поиск...</span>
            </div>
            <Link
              href="#"
              className="md:hidden text-[#F5653E] text-sm font-medium hover:underline"
            >
              Все
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {MOCK_SPECIALISTS.map((doc) => (
              <div
                key={doc.id}
                className="bg-white border border-[#E3E4E5] rounded-2xl p-4 flex flex-col"
              >
                <div className="h-48 bg-[#FFEFE5] rounded-xl mb-4 flex items-center justify-center text-xs text-gray-400">
                  Фото врача
                </div>
                <h4 className="font-semibold text-[#191A1B]">{doc.name}</h4>
                <p className="text-xs text-[#838A8D] mb-2">{doc.specialty}</p>
                <span className="text-xs text-[#838A8D] mb-4">
                  ⭐ {doc.rating} ({doc.reviews}) • {doc.experience} лет стажа
                </span>
                <Button
                  variant="outline"
                  className="w-full justify-center mt-auto"
                >
                  Записаться
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* --- СЕКЦИЯ: ОТЗЫВЫ --- */}
        <div className="mt-10 md:mt-20 mb-10 md:mb-20 md:px-0 bg-white rounded-[20px] p-4 mx-2">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-2xl font-semibold text-[#191A1B]">Отзывы</h2>
            <Link
              href="#"
              className="md:hidden text-[#F5653E] text-sm font-medium hover:underline"
            >
              Все
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            <div className="w-full md:w-100 shrink-0 flex flex-col gap-5">
              <div className="flex gap-4">
                <div className="flex-1 bg-white md:bg-transparent border border-[#E3E4E5] rounded-2xl p-6 flex flex-col items-center md:items-start justify-center">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-[#FFA18D] p-2.5 rounded-xl size-10">
                      <StarIcon className="size-5 text-white" />
                    </div>
                    <span className="text-[24px] font-semibold text-[#191A1B]">
                      4.85
                    </span>
                  </div>
                  <span className="text-[#838A8D]">Средняя оценка</span>
                </div>
                <div className="flex-1 bg-white md:bg-transparent border border-[#E3E4E5] rounded-2xl p-6 flex flex-col items-center md:items-start justify-center">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-[#FFA18D] p-2.5 rounded-xl size-10">
                      <ChatIcon className="size-5 text-white" />
                    </div>
                    <span className="text-[24px] font-semibold text-[#191A1B]">
                      255
                    </span>
                  </div>
                  <span className="text-[#838A8D]">Всего отзывов</span>
                </div>
              </div>
              {/* Кнопка "Оставить отзыв" для мобилки */}
              <Button
                variant="outline"
                className="md:hidden w-full justify-center bg-white"
              >
                Оставить свой отзыв
              </Button>

              {/* Форма "Оставить отзыв" для ПК */}
              <div className="hidden md:flex flex-col bg-white border border-[#E3E4E5] rounded-2xl p-4">
                <h3 className="font-medium text-[20px] text-[#191A1B] mb-6">
                  Оставьте свой отзыв
                </h3>
                <span className="text-base mb-2">Оцените специалиста</span>

                {/* Звездочки */}
                <div className="flex justify-center gap-5 py-4 mb-6 border border-[#E5E6E8] rounded-xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon key={star} className="size-10 text-[#E5E6E8]" />
                  ))}
                </div>

                <span className="text-base mb-2">
                  Поделитесь своим мнением о клинике
                </span>
                <textarea
                  className="w-full border border-[#E3E4E5] rounded-xl p-3 text-sm outline-none focus:border-[#F5653E] resize-none h-24 mb-4"
                  placeholder="Введите текст"
                />

                <Button size="md" className="w-full justify-center">
                  Отправить
                </Button>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              {MOCK_REVIEWS.map((review) => (
                <div
                  key={review.id}
                  className="bg-white border border-[#E3E4E5] rounded-2xl p-5 flex flex-col gap-4"
                >
                  <p className="text-[#838A8D] text-sm leading-relaxed">
                    {review.text}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-[#E3E4E5]" />
                      <div className="flex flex-col">
                        <span className="text-[#191A1B] font-medium text-sm">
                          {review.author}
                        </span>
                        <span className="text-[#838A8D] text-xs">
                          {review.date}
                        </span>
                      </div>
                    </div>
                    <span className="text-white flex bg-[#FFA18D] py-1 px-2 rounded-full">
                      <StarIcon className="size-4" />
                      <StarIcon className="size-4" />
                      <StarIcon className="size-4" />
                      <StarIcon className="size-4" />
                      <StarIcon className="size-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Липкая кнопка для мобилки */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-[#E3E4E5] z-50">
        <Button className="w-full justify-center" size="lg">
          Записаться на приём
        </Button>
      </div>
    </main>
  );
};
