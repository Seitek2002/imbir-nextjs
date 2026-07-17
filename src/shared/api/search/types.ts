export type SearchSuggestDoctor = {
  id: number;
  full_name: string;
  specialty: string;
  photo: string | null;
};

export type SearchSuggestClinic = {
  id: number;
  name: string;
  logo: string | null;
};

export type SearchSuggestService = {
  id: number;
  name: string;
  price: string;
  category: string;
};

// /api/search/suggest/ — быстрый автокомплит, до 5 записей в каждой
// категории и только поля, нужные для строки подсказки (в отличие от
// /api/search/, который отдаёт полные карточки).
export type SearchSuggestResponse = {
  doctors: SearchSuggestDoctor[];
  clinics: SearchSuggestClinic[];
  services: SearchSuggestService[];
};
