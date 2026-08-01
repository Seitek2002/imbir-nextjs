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

export type ServiceDetail = ServiceListItem & {
  description: string;
  clinic: string;
  doctor: string;
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
