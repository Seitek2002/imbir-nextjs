"use client";

import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";

import type {
  Map as LeafletMap,
  Marker as LeafletMarker,
  LeafletMouseEvent,
} from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  type GeocodeResult,
  reverseGeocode,
  searchAddress,
} from "@/shared/api";
import {
  CITY_COORDS,
  COUNTRY_CENTER,
  COUNTRY_ISO,
  DEFAULT_COUNTRY,
  colors,
} from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";

export type LocationValue = {
  latitude: string;
  longitude: string;
};

type Props = {
  latitude: string;
  longitude: string;
  // Город и страна из формы: определяют, на чём открыть карту и в каких
  // границах Nominatim ищет введённый адрес.
  city?: string;
  country?: string;
  // Адрес показывается в плашке под картой. Если передан onAddressChange,
  // выбор точки на карте перезапишет его обратным геокодингом.
  address?: string;
  onChange: (value: LocationValue) => void;
  onAddressChange?: (address: string) => void;
  label?: string;
  error?: string;
  className?: string;
};

// Пин рисуем divIcon'ом, а не картинкой Leaflet: дефолтные marker-icon.png
// подтягиваются относительными путями и в сборке Next ломаются, плюс так пин
// совпадает по цвету с остальным интерфейсом.
const PIN_HTML = `
<div style="position:relative;width:32px;height:40px;">
  <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.716 0 1 6.716 1 15c0 10.5 15 25 15 25s15-14.5 15-25C31 6.716 24.284 0 16 0z"
      fill="${colors.primary}" stroke="#fff" stroke-width="2"/>
    <circle cx="16" cy="14.5" r="5" fill="#fff"/>
  </svg>
</div>`;

const POINT_ZOOM = 16;
const COUNTRY_ZOOM = 7;
const CITY_ZOOM = 12;
const FALLBACK_CENTER = { lat: 41.2044, lng: 74.7661 };

// Бэк принимает latitude/longitude как decimal-строки с паттерном
// ^-?\d{0,3}(?:\.\d{0,6})?$ (схема ClinicOwnProfileRequest), поэтому округляем
// до шести знаков — это ~11 см, заведомо точнее, чем нужно для входа в клинику.
const toFixed6 = (n: number): string => n.toFixed(6);

const parsePoint = (
  latitude: string,
  longitude: string,
): { lat: number; lng: number } | null => {
  if (!latitude || !longitude) return null;
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
};

export const LocationPicker: FC<Props> = ({
  latitude,
  longitude,
  city,
  country = DEFAULT_COUNTRY,
  address,
  onChange,
  onAddressChange,
  label = "Геолокация",
  error,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  // Колбэки читаются из обработчиков Leaflet, которые навешиваются один раз при
  // инициализации карты. Через ref — чтобы не пересоздавать карту на каждый
  // рендер родителя и при этом не звать устаревший onChange.
  const onChangeRef = useRef(onChange);
  const onAddressChangeRef = useRef(onAddressChange);
  // Точка, поставленная изнутри компонента. Нужна, чтобы эффект синхронизации
  // не дёргал карту в ответ на наше же изменение — пин уже там, где надо.
  const selfSetRef = useRef<string | null>(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  onChangeRef.current = onChange;
  onAddressChangeRef.current = onAddressChange;

  // Мемо, чтобы объект точки был стабилен между рендерами: он стоит в
  // зависимостях эффектов, которые двигают карту.
  const point = useMemo(
    () => parsePoint(latitude, longitude),
    [latitude, longitude],
  );
  const countryCode = COUNTRY_ISO[country];
  // CITY_COORDS — модульная константа, ссылка на запись города уже стабильна.
  const cityCenter = city ? CITY_COORDS[city] : undefined;

  // Единственное место, где координаты уходят наружу.
  const commitPoint = useCallback(
    (lat: number, lng: number, { geocode = true } = {}) => {
      const next = { latitude: toFixed6(lat), longitude: toFixed6(lng) };
      selfSetRef.current = `${next.latitude},${next.longitude}`;
      onChangeRef.current(next);

      if (!geocode || !onAddressChangeRef.current) return;
      reverseGeocode({ lat, lng })
        .then((res) => {
          if (res?.address) onAddressChangeRef.current?.(res.address);
        })
        .catch(() => {
          // Адрес — удобство, а не обязательное поле: координаты уже
          // проставлены, и пользователь дозаполнит адрес руками.
        });
    },
    [],
  );

  const attachMarker = useCallback(
    (
      L: typeof import("leaflet"),
      map: LeafletMap,
      lat: number,
      lng: number,
    ) => {
      const marker = L.marker([lat, lng], {
        draggable: true,
        autoPan: true,
        icon: L.divIcon({
          html: PIN_HTML,
          className: "",
          iconSize: [32, 40],
          iconAnchor: [16, 40],
        }),
      }).addTo(map);

      marker.on("dragend", () => {
        const p = marker.getLatLng();
        commitPoint(p.lat, p.lng);
      });

      markerRef.current = marker;
    },
    [commitPoint],
  );

  // --- Инициализация карты: ровно один раз за монтирование ---
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      // Leaflet трогает window на верхнем уровне модуля, поэтому импорт
      // динамический — статический уронил бы SSR этой страницы.
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      leafletRef.current = L;

      const start =
        point ?? cityCenter ?? COUNTRY_CENTER[country] ?? FALLBACK_CENTER;
      const zoom = point ? POINT_ZOOM : cityCenter ? CITY_ZOOM : COUNTRY_ZOOM;

      const map = L.map(containerRef.current, {
        center: [start.lat, start.lng],
        zoom,
        zoomControl: true,
        // Прокрутка колесом внутри длинной формы уводила бы страницу в зум
        // карты. Зум остаётся на кнопках, двойном клике и щипке на тачскрине.
        scrollWheelZoom: false,
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      map.on("click", (e: LeafletMouseEvent) => {
        commitPoint(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      if (point) attachMarker(L, map, point.lat, point.lng);

      // Карта монтируется внутри шага мастера: при переходе между шагами
      // Leaflet иногда остаётся с прежними размерами контейнера.
      requestAnimationFrame(() => map.invalidateSize());
    };

    void init();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Карта создаётся один раз; за реакцию на смену пропов отвечают эффекты ниже.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Пин следует за координатами, пришедшими извне ---
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    if (!point) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const key = `${toFixed6(point.lat)},${toFixed6(point.lng)}`;

    if (markerRef.current) markerRef.current.setLatLng([point.lat, point.lng]);
    else attachMarker(L, map, point.lat, point.lng);

    // Своё же перетаскивание карту не двигает — иначе пин убегает из-под
    // курсора. Центрируем только когда координаты пришли снаружи: из поиска,
    // из профиля клиники или от кнопки «моё местоположение».
    if (selfSetRef.current !== key) {
      map.setView([point.lat, point.lng], Math.max(map.getZoom(), POINT_ZOOM));
    }
    selfSetRef.current = null;
  }, [point, attachMarker]);

  // --- Пока точка не выбрана, карта следует за выбранным городом ---
  useEffect(() => {
    const map = mapRef.current;
    if (!map || point || !cityCenter) return;
    map.setView([cityCenter.lat, cityCenter.lng], CITY_ZOOM);
  }, [cityCenter, point]);

  // --- Поиск адреса с дебаунсом ---
  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    const timer = setTimeout(() => {
      searchAddress(
        query,
        { countryCode, near: cityCenter, limit: 5 },
        controller.signal,
      )
        .then((res) => {
          if (!controller.signal.aborted) setSuggestions(res);
        })
        .catch(() => {
          if (!controller.signal.aborted) setSuggestions([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsSearching(false);
        });
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, countryCode, cityCenter]);

  const handlePickSuggestion = (result: GeocodeResult) => {
    setQuery("");
    setSuggestions([]);
    // Адрес берём из самой подсказки — обратный геокодинг тут лишний запрос.
    commitPoint(result.point.lat, result.point.lng, { geocode: false });
    onAddressChangeRef.current?.(result.address);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Геолокация не поддерживается вашим браузером");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        commitPoint(position.coords.latitude, position.coords.longitude);
      },
      (geoError) => {
        setIsLocating(false);
        toast.error(
          geoError.code === geoError.PERMISSION_DENIED
            ? "Доступ к геолокации запрещён — отметьте клинику на карте"
            : "Не удалось определить местоположение",
        );
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  // Сброс убирает и адрес: он был получен обратным геокодингом этой самой
  // точки, и оставлять его при снятом пине — показывать адрес, к которому в
  // форме больше не привязано координат.
  const handleClear = () => {
    selfSetRef.current = null;
    onChangeRef.current({ latitude: "", longitude: "" });
    onAddressChangeRef.current?.("");
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium text-overlay">{label}</span>

      <div className="relative">
        <Input
          placeholder="Найдите адрес или отметьте точку на карте"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        {(isSearching || suggestions.length > 0) && (
          <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg overflow-hidden">
            {suggestions.length === 0 ? (
              <div className="px-3 py-2.5 text-sm text-muted">Ищем адрес…</div>
            ) : (
              suggestions.map((s) => (
                <button
                  key={s.displayName}
                  type="button"
                  className="w-full text-left px-3 py-2.5 text-sm text-foreground hover:bg-background border-b border-border last:border-b-0"
                  onClick={() => handlePickSuggestion(s)}
                >
                  {s.displayName}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div
        className={cn(
          "rounded-xl overflow-hidden border",
          error ? "border-[#EC778D]" : "border-border",
        )}
      >
        <div className="relative">
          <div
            ref={containerRef}
            className="h-56 md:h-72 w-full bg-background z-0"
          />

          {!point && (
            // pointer-events-none — подсказка не должна перехватывать клик,
            // которым точка и ставится.
            <div className="absolute inset-x-0 top-3 z-10 flex justify-center pointer-events-none px-3">
              <span className="bg-overlay/75 text-white text-xs px-3 py-1.5 rounded-full text-center">
                Нажмите на карту, чтобы отметить клинику
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            aria-label="Определить моё местоположение"
            className="absolute bottom-3 right-3 z-10 size-9 bg-white rounded-full shadow flex items-center justify-center disabled:opacity-60"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M14.5 1.5L9.5 14.5l-2-6-6-2 13-5z"
                stroke={colors.primary}
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="px-4 py-3 bg-white border-t border-border flex items-start gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0 mt-0.5"
          >
            <path
              d="M8 14.667S13 10.5 13 6.667a5 5 0 10-10 0C3 10.5 8 14.667 8 14.667z"
              stroke={point ? colors.primary : colors.muted}
              strokeWidth="1.2"
            />
            <circle
              cx="8"
              cy="6.667"
              r="1.833"
              stroke={point ? colors.primary : colors.muted}
              strokeWidth="1.2"
            />
          </svg>
          <div className="min-w-0 flex-1">
            <div className="text-sm text-foreground break-words">
              {address || (point ? "Адрес не определён" : "Точка не выбрана")}
            </div>
            {point && (
              <div className="text-xs text-muted mt-0.5">
                {latitude}, {longitude}
              </div>
            )}
          </div>
          {point && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-muted hover:text-primary shrink-0"
            >
              Сбросить
            </button>
          )}
        </div>
      </div>

      {error && <span className="text-xs text-[#DF1C41]">{error}</span>}
    </div>
  );
};
