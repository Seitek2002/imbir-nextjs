export type ServiceListItem = {
  id: number;
  name: string;
  category: string;
  price: string | null;
  duration: number | null;
  clinic?: {
    id: number;
    name: string;
    logo?: string | null;
  } | null;
  rating?: string | null;
  reviews_count?: string | null;
  photo?: string | null;
};

// GET /api/services/{id}/ — проверено живым запросом, отличается от списка:
// clinic — объект (не просто имя), плюс doctor (один, если услуга закреплена
// за конкретным врачом) и doctors (полный список врачей, которые её ведут;
// пусто, если услуга «общеклиническая» и закреплённого врача нет).
export type ServiceDoctor = {
  id: number;
  full_name: string;
  photo?: string | null;
};

export type ServiceDetail = Omit<ServiceListItem, "clinic"> & {
  description: string;
  clinic: { id: number; name: string; logo?: string | null } | null;
  doctor: ServiceDoctor | null;
  doctors: ServiceDoctor[];
};

export type ServiceFilters = {
  search?: string;
  category?: string;
  clinic_id?: number | string;
  doctor_id?: number | string;
  min_rating?: number;
  min_price?: number;
  max_price?: number;
  page?: number;
  page_size?: number;
};
