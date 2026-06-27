import { DoctorListItem as ApiDoctor } from "@/shared/api";

const emptySchedule = {
  mon: null,
  tue: null,
  wed: null,
  thu: null,
  fri: null,
  sat: null,
  sun: null,
  lunchBreak: null,
};

// Maps API snake_case doctor to the camelCase props expected by DoctorCard
export const adaptDoctor = (d: ApiDoctor) => ({
  id: d.id,
  name: d.full_name,
  specialty: d.specialty,
  experience: d.experience_years,
  isOnlineAvailable: d.is_online_available,
  rating: d.rating,
  reviews: d.reviews_count,
  image: d.photo ?? undefined,
  workplaces: d.workplaces.map((w) => ({
    clinicId: String(w.clinic_id),
    clinicName: w.clinic_name,
    price: w.price,
    schedule: emptySchedule,
  })),
});
