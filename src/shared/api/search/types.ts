export type SearchSuggestDoctor = {
  full_name: string;
  id: number;
  photo: null | string;
  specialty: string;
};

export type SearchSuggestClinic = {
  id: number;
  logo: null | string;
  name: string;
};

export type SearchSuggestService = {
  category: string;
  id: number;
  name: string;
  price: string;
};

// /api/search/suggest/ — быстрый автокомплит, до 5 записей в каждой
// категории и только поля, нужные для строки подсказки (в отличие от
// /api/search/, который отдаёт полные карточки).
export type SearchSuggestResponse = {
  clinics: SearchSuggestClinic[];
  doctors: SearchSuggestDoctor[];
  services: SearchSuggestService[];
};
