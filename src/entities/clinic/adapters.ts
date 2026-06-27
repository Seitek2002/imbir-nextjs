import { ClinicListItem } from "@/shared/api";

export const adaptClinic = (c: ClinicListItem) => ({
  id: String(c.id),
  name: c.name,
  experience: c.experience_years ?? 0,
  rating: c.rating,
  reviews: c.reviews_count,
  address: c.address ?? "",
  image: c.logo ?? undefined,
  specialties: c.primary_specializations ?? [],
});
