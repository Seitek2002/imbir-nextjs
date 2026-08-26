export type ServiceListItem = {
  category: string;
  clinic?: {
    id: number;
    logo?: null | string;
    name: string;
  } | null;
  duration: null | number;
  id: number;
  name: string;
  photo?: null | string;
  price: null | string;
  rating?: null | string;
  reviews_count?: null | string;
};

// GET /api/services/{id}/ — проверено живым запросом, отличается от списка:
// clinic — объект (не просто имя), плюс doctor (один, если услуга закреплена
// за конкретным врачом) и doctors (полный список врачей, которые её ведут;
// пусто, если услуга «общеклиническая» и закреплённого врача нет).
export type ServiceDoctor = {
  full_name: string;
  id: number;
  photo?: null | string;
};

export type ServiceDetail = Omit<ServiceListItem, "clinic"> & {
  clinic: { id: number; logo?: null | string; name: string } | null;
  description: string;
  doctor: null | ServiceDoctor;
  doctors: ServiceDoctor[];
};

export type ServiceFilters = {
  category?: string;
  clinic_id?: number | string;
  doctor_id?: number | string;
  max_price?: number;
  min_price?: number;
  min_rating?: number;
  page?: number;
  page_size?: number;
  search?: string;
};
