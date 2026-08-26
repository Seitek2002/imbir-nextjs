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
  photo?: string | null;
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
  id: number;
  name: string;
  description: string;
  percent: number;
  image: string | null;
};

export type UserAccountStatus = {
  user_id: number;
  reviews_count: number;
  average_rating: number | null;
  percent: number | null;
  status: UserStatus | null;
};

export type UserAccountStatusResponse = {
  data: UserAccountStatus;
};

// Общесайтовые настройки (синглтон в админке): контакты, соцсети и
// юридические тексты. На бэке заведены прямо под футер и страницы условий —
// любое поле может быть пустой строкой, если его ещё не заполнили.
export type SiteSettings = {
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  linkedin_url: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  terms_text: string;
  privacy_policy_text: string;
};

export type SiteSettingsResponse = {
  data: SiteSettings;
};
