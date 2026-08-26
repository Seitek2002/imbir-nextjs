import type { GeoPoint, GeocodeResult, NominatimPlace } from "./types";

// Геокодинг живёт на Nominatim (OpenStreetMap), а не на apiClient: это внешний
// сервис, ему не нужны ни baseURL нашего бэка, ни Bearer-токен, ни интерсептор
// refresh. Выбран он потому, что не требует ключа и биллинга — карта в форме
// регистрации работает сразу, без ожидания ключа от 2GIS или Яндекса.
const NOMINATIM = "https://nominatim.openstreetmap.org";

// Usage policy Nominatim — не чаще одного запроса в секунду с одного клиента.
// Запросы идут из браузера пользователя (не через наш сервер), поэтому лимит
// считается на его IP, но дребезг ввода в поиске легко даёт три запроса за
// секунду, и без этой очереди сервис начинает отвечать 429.
const MIN_INTERVAL_MS = 1100;
let lastCallAt = 0;
let chain: Promise<unknown> = Promise.resolve();

const throttle = <T>(task: () => Promise<T>): Promise<T> => {
  const run = async (): Promise<T> => {
    const wait = Math.max(0, lastCallAt + MIN_INTERVAL_MS - Date.now());
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastCallAt = Date.now();
    return task();
  };
  // Ошибка одного запроса не должна рвать очередь для следующих.
  const result = chain.then(run, run);
  chain = result.catch(() => undefined);
  return result;
};

const request = async <T>(
  path: string,
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<T> => {
  const url = new URL(`${NOMINATIM}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "ru");

  const res = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  return res.json() as Promise<T>;
};

// Короткая строка для поля «Полный адрес». Nominatim в display_name отдаёт всё
// вплоть до страны и индекса («…, Бишкек, 720000, Кыргызстан») — в форме нужен
// только сам адрес, город там уже выбран отдельным полем.
const toShortAddress = (place: NominatimPlace): string => {
  const a = place.address;
  if (!a) return place.display_name;

  const area = a.neighbourhood ?? a.residential ?? a.suburb ?? a.city_district;
  const street = [a.road, a.house_number].filter(Boolean).join(" ");
  const parts = [area, street].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : place.display_name;
};

const toResult = (place: NominatimPlace): GeocodeResult => ({
  point: { lat: Number(place.lat), lng: Number(place.lon) },
  address: toShortAddress(place),
  displayName: place.display_name,
});

// Точка → адрес. Вызывается после того, как пользователь перетащил пин или
// нажал «моё местоположение»: адресную строку заполняем за него.
export const reverseGeocode = async (
  point: GeoPoint,
  signal?: AbortSignal,
): Promise<GeocodeResult | null> => {
  const place = await throttle(() =>
    request<NominatimPlace & { error?: string }>(
      "/reverse",
      { lat: String(point.lat), lon: String(point.lng), zoom: "18" },
      signal,
    ),
  );
  return place.error || !place.lat ? null : toResult(place);
};

// Адрес → точка. `countryCode` (ISO-2) сужает выдачу до страны из формы,
// `near` поднимает наверх результаты вокруг выбранного города.
export const searchAddress = async (
  query: string,
  opts: { countryCode?: string; limit?: number; near?: GeoPoint } = {},
  signal?: AbortSignal,
): Promise<GeocodeResult[]> => {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const params: Record<string, string> = {
    q: trimmed,
    limit: String(opts.limit ?? 5),
  };
  if (opts.countryCode) params.countrycodes = opts.countryCode;
  if (opts.near) {
    // Рамка ~±0.35° вокруг города (примерно 30–40 км). Без bounded=1 это
    // приоритет, а не фильтр: адрес за рамкой всё ещё найдётся, но ниже.
    const { lat, lng } = opts.near;
    params.viewbox = `${lng - 0.35},${lat + 0.35},${lng + 0.35},${lat - 0.35}`;
  }

  const places = await throttle(() =>
    request<NominatimPlace[]>("/search", params, signal),
  );
  return Array.isArray(places) ? places.map(toResult) : [];
};
