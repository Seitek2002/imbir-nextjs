export type GeoPoint = { lat: number; lng: number };

// Разобранный результат Nominatim. `address` — короткая строка для поля
// «Полный адрес» (улица, дом, район), `displayName` — полная, для подсказок.
export type GeocodeResult = {
  address: string;
  displayName: string;
  point: GeoPoint;
};

// Ответ Nominatim (format=jsonv2). Перечислены только читаемые нами поля:
// формат отдаёт заметно больше, но остальное нам не нужно.
export type NominatimAddress = {
  city?: string;
  city_district?: string;
  house_number?: string;
  neighbourhood?: string;
  residential?: string;
  road?: string;
  suburb?: string;
  town?: string;
  village?: string;
};

export type NominatimPlace = {
  address?: NominatimAddress;
  display_name: string;
  lat: string;
  lon: string;
};
