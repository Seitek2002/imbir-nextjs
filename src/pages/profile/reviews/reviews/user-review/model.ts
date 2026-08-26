export type ReviewType = "clinic" | "doctor" | "service";

export type UserReview = {
  clinicAddress?: string;
  // Для клиник
  clinicName?: string;
  comment: string;
  date: string;
  doctorClinic?: string;
  // Для врачей
  doctorName?: string;
  doctorSpecialty?: string;

  id: string;
  image?: string;

  rating: number;
  // Ответ врача/клиники на отзыв, если есть.
  reply?: { date: string; text: string } | null;
  serviceCategory?: string;

  serviceClinic?: string;
  // Для услуг
  serviceName?: string;
  type: ReviewType;
};
