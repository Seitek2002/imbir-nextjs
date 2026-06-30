import Image from "next/image";

import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

import { ROUTES } from "@/shared/config";

const VIDEOS = [
  {
    id: "1",
    title: "Как сохранить здоровье сердца: советы кардиолога",
    doctor: "Токтосунова Айгуль Бекова",
    specialty: "Кардиолог",
    duration: "14:32",
    date: "12 мая 2025",
    thumb: "https://placehold.co/640x360/FEF3F0/F5653E?text=▶",
    views: "3 412",
  },
  {
    id: "2",
    title: "Головные боли: мигрень или остеохондроз?",
    doctor: "Исакова Гульнара Турдуевна",
    specialty: "Невролог",
    duration: "18:05",
    date: "5 мая 2025",
    thumb: "https://placehold.co/640x360/F0F4FE/3B82F6?text=▶",
    views: "2 188",
  },
  {
    id: "3",
    title: "Дерматология: как правильно ухаживать за кожей",
    doctor: "Джумабекова Анара Сатыбековна",
    specialty: "Дерматолог",
    duration: "11:47",
    date: "28 апреля 2025",
    thumb: "https://placehold.co/640x360/F0FEF3/4CAF50?text=▶",
    views: "1 574",
  },
  {
    id: "4",
    title: "Детское здоровье: прививки и иммунитет",
    doctor: "Мамытов Бакыт Эркинович",
    specialty: "Педиатр",
    duration: "22:10",
    date: "20 апреля 2025",
    thumb: "https://placehold.co/640x360/FFF8E1/FF9800?text=▶",
    views: "5 230",
  },
  {
    id: "5",
    title: "Зрение и экраны: как сохранить глаза в цифровую эпоху",
    doctor: "Карыбеков Азиз Болотович",
    specialty: "Офтальмолог",
    duration: "9:58",
    date: "14 апреля 2025",
    thumb: "https://placehold.co/640x360/F0F4FE/6366F1?text=▶",
    views: "4 007",
  },
  {
    id: "6",
    title: "Гинекология: мифы и правда о женском здоровье",
    doctor: "Рысбекова Залина Канатовна",
    specialty: "Гинеколог",
    duration: "16:20",
    date: "7 апреля 2025",
    thumb: "https://placehold.co/640x360/FCE4EC/E91E63?text=▶",
    views: "6 841",
  },
  {
    id: "7",
    title: "Хирургия без страха: что нужно знать пациенту",
    doctor: "Усубалиев Темирбек Айтматович",
    specialty: "Хирург",
    duration: "20:44",
    date: "1 апреля 2025",
    thumb: "https://placehold.co/640x360/E8F5E9/388E3C?text=▶",
    views: "2 993",
  },
  {
    id: "8",
    title: "Холтеровское мониторирование: зачем и как",
    doctor: "Токтосунова Айгуль Бекова",
    specialty: "Кардиолог",
    duration: "13:15",
    date: "24 марта 2025",
    thumb: "https://placehold.co/640x360/FEF3F0/F5653E?text=▶",
    views: "1 201",
  },
];

export default function VideosPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header title="Интервью" backTo={ROUTES.HOME} />

      <div className="flex-1 w-full max-w-360 mx-auto px-4 md:px-10 py-10">
        {/* Header section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Интервью с врачами
          </h1>
          <p className="text-secondary text-base md:text-lg">
            Наши специалисты делятся знаниями, советами и отвечают на частые
            вопросы
          </p>
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {VIDEOS.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-3xl overflow-hidden border border-border hover:border-primary/40 transition-colors cursor-pointer group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-background">
                <Image
                  src={v.thumb}
                  alt={v.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="size-12 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-5 text-primary translate-x-0.5"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                {/* Duration badge */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-md font-medium">
                  {v.duration}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-foreground font-semibold text-sm leading-snug mb-3 line-clamp-2">
                  {v.title}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-7 rounded-full bg-[#FEF3F0] flex items-center justify-center text-xs font-semibold text-primary">
                    {v.doctor.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {v.doctor}
                    </p>
                    <p className="text-xs text-muted">{v.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{v.date}</span>
                  <span>{v.views} просмотров</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:block mt-auto">
        <Footer />
      </div>
    </main>
  );
}
