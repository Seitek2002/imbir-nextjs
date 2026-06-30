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
