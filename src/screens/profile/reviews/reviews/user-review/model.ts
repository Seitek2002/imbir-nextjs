export type ReviewType = "clinic" | "doctor" | "service";

export type UserReview = {
  id: string;
  type: ReviewType;
  rating: number;
  comment: string;
  date: string;
  image?: string;

  // Для клиник
  clinicName?: string;
  clinicAddress?: string;

  // Для врачей
  doctorName?: string;
  doctorSpecialty?: string;
  doctorClinic?: string;

  // Для услуг
  serviceName?: string;
  serviceCategory?: string;
  serviceClinic?: string;
};

export const MOCK_USER_REVIEWS: UserReview[] = [
  // Клиники
  {
    id: "1",
    type: "clinic",
    clinicName: "Nova Clinic",
    clinicAddress: "ул. Московская, 189",
    rating: 5,
    comment:
      "Алина Тимуровна внимательна, добра и очень тщательна. Она убедилась, что на все мои вопросы даны ответы, и очень терпеливо объяснила мой диагноз",
    date: "20 нояб, 2025",
  },
  {
    id: "2",
    type: "clinic",
    clinicName: "Nova Clinic",
    clinicAddress: "ул. Московская, 189",
    rating: 5,
    comment:
      "Алина Тимуровна внимательна, добра и очень тщательна. Она убедилась, что на все мои вопросы даны ответы, и очень терпеливо объяснила мой диагноз",
    date: "20 нояб, 2025",
  },

  // Специалисты
  {
    id: "3",
    type: "doctor",
    doctorName: "Жумабаев Д. Р.",
    doctorSpecialty: "Врач-невролог",
    doctorClinic: "Nova Clinic",
    rating: 5,
    comment:
      "Алина Тимуровна внимательна, добра и очень тщательна. Она убедилась, что на все мои вопросы даны ответы, и очень терпеливо объяснила мой диагноз",
    date: "20 нояб, 2025",
  },
  {
    id: "4",
    type: "doctor",
    doctorName: "Садыкова А. Т.",
    doctorSpecialty: "Врач-невролог",
    doctorClinic: "Nova Clinic",
    rating: 5,
    comment:
      "Алина Тимуровна внимательна, добра и очень тщательна. Она убедилась, что на все мои вопросы даны ответы, и очень терпеливо объяснила мой диагноз",
    date: "20 нояб, 2025",
  },

  // Услуги
  {
    id: "5",
    type: "service",
    serviceName: "Анализ крови",
    serviceCategory: "Кардиология",
    serviceClinic: "Nova Clinic",
    rating: 5,
    comment:
      "Доктор Нурлан Эльдарович внимателен, добр и очень тщателен. Он убедился, что на все мои вопросы даны ответы, и очень терпеливо объяснил мой диагноз",
    date: "20 Ноября, 2025",
  },
  {
    id: "6",
    type: "service",
    serviceName: "УЗИ",
    serviceCategory: "Кардиология",
    serviceClinic: "Nova Clinic",
    rating: 5,
    comment:
      "Доктор Нурлан Эльдарович внимателен, добр и очень тщателен. Он убедился, что на все мои вопросы даны ответы, и очень терпеливо объяснил мой диагноз",
    date: "20 Ноября, 2025",
  },
];
