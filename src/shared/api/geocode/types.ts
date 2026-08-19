export type GeoPoint = { lat: number; lng: number };

// Разобранный результат Nominatim. `address` — короткая строка для поля
// «Полный адрес» (улица, дом, район), `displayName` — полная, для подсказок.
export type GeocodeResult = {
  point: GeoPoint;
  address: string;
  displayName: string;
};

// Ответ Nominatim (format=jsonv2). Перечислены только читаемые нами поля:
// формат отдаёт заметно больше, но остальное нам не нужно.
export type NominatimAddress = {
  road?: string;
  house_number?: string;
  neighbourhood?: string;
  residential?: string;
  suburb?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
};

export type NominatimPlace = {
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
};
