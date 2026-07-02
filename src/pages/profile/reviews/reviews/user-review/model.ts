export type ReviewType = "clinic" | "doctor" | "service";

export type UserReview = {
  id: string;
  type: ReviewType;
  rating: number;
  comment: string;
  date: string;
  image?: string;
  // Ответ врача/клиники на отзыв, если есть.
  reply?: { text: string; date: string } | null;

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
