// References return { data: string[] } (not [{ id, name }])
export type ReferenceListResponse = {
  data: string[];
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
