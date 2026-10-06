// Запись справочника категорий (GET /api/service-categories/).
export type ServiceCategoryRef = {
  id: number;
  title: string;
};

export type ServiceListItem = {
  // Старое текстовое поле. Пока бэк хранит его рядом со справочником, а
  // фронт подставляет сюда service_category.title, если он есть (см.
  // withCategoryTitle) — поэтому все списки и карточки читают только category.
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
  // price — Decimal, поэтому строка ("100.00"). А вот rating и reviews_count у услуг
  // считаются агрегатом и приходят числами — в отличие от врача и клиники, где
  // rating строка. Расхождение на стороне бэка, здесь просто описано как есть.
  price: null | string;
  rating?: null | number;
  reviews_count?: null | number;
  service_category?: null | ServiceCategoryRef;
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
