import type { ServiceListItem as ApiService } from "@/shared/api/services/types";

// ServiceList from real API is minimal — clinic/rating/image are not in the list endpoint
export const adaptService = (s: ApiService) => ({
  id: String(s.id),
  name: s.name,
  category: s.category,
  clinic: "",
  clinicId: "",
  rating: 0,
  reviews: 0,
  price: typeof s.price === "string" ? parseFloat(s.price) || 0 : 0,
  image: undefined as string | undefined,
});
