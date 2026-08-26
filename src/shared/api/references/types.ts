// Большинство справочников (/cities, /languages, /clinic-types, /equipment,
// /conditions, /payment-methods) отдают { data: string[] } — просто список
// значений без id.
export type ReferenceListResponse = {
  data: string[];
};

// Специализации — единственный справочник с полноценными объектами (id,
// name, photo) вместо голых строк; проверено живым запросом.
export type SpecializationItem = {
  id: number;
  name: string;
  photo?: null | string;
};

export type SpecializationListResponse = {
  data: SpecializationItem[];
};

// GET /api/references/country-codes/ — телефонные коды стран для выпадающего
// списка в формах (регистрация, сброс пароля). Авторизация не требуется.
export type CountryCode = {
  code: string; // "+996"
  country: string; // "Кыргызстан"
  flag: string; // "🇰🇬"
  iso: string; // "KG"
};

export type CountryCodesResponse = {
  data: CountryCode[];
};

// GET /api/references/user-status/{user_id}/ — статус пользователя КАК
// РЕЦЕНЗЕНТА, по среднему баллу отзывов, которые он сам оставил (не рейтинг
// того, кого он оценивает). Авторизация не требуется. Если отзывов нет —
// status: null.
export type UserStatus = {
  description: string;
  id: number;
  image: null | string;
  name: string;
  percent: number;
};

export type UserAccountStatus = {
  average_rating: null | number;
  percent: null | number;
  reviews_count: number;
  status: null | UserStatus;
  user_id: number;
};

export type UserAccountStatusResponse = {
  data: UserAccountStatus;
};

// Общесайтовые настройки (синглтон в админке): контакты, соцсети и
// юридические тексты. На бэке заведены прямо под футер и страницы условий —
// любое поле может быть пустой строкой, если его ещё не заполнили.
export type SiteSettings = {
  address: string;
  contact_email: string;
  contact_phone: string;
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  privacy_policy_text: string;
  terms_text: string;
  twitter_url: string;
};

export type SiteSettingsResponse = {
  data: SiteSettings;
};
