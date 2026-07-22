import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Maps Netlify English city names to Russian equivalents used in the app
const CITY_MAP: Record<string, string> = {
  Bishkek: "Бишкек",
  Osh: "Ош",
  "Jalal-Abad": "Джалал-Абад",
  Karakol: "Каракол",
  Tokmok: "Токмок",
  Kant: "Кант",
  Naryn: "Нарын",
  Talas: "Талас",
  Batken: "Баткен",
};

// Разделы кабинетов, защищённые AuthGuard на клиенте — здесь дублируем
// проверку на границе middleware, чтобы неавторизованный пользователь не
// увидел даже первый SSR-кадр защищённой страницы.
const PROTECTED_PREFIXES = [
  "/profile",
  "/doctor-profile",
  "/clinic-profile",
  "/consultation",
];

const isProtectedPath = (pathname: string) =>
  PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

export function middleware(request: NextRequest) {
  // --- Auth-гейт: независимый от гео-логики ниже механизм. Использует
  // cookie is_authed (см. src/shared/store/authStore.ts) — НЕ пересекается
  // с city/imbir-city-set/imbir-detected-city ни по имени, ни по назначению.
  if (isProtectedPath(request.nextUrl.pathname)) {
    if (!request.cookies.get("is_authed")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // --- Гео-логика (определение города) — как была, без изменений ---
  const response = NextResponse.next();

  // Don't overwrite if user already confirmed/selected their city
  if (request.cookies.get("imbir-city-set")) return response;

  let detectedCity = "Бишкек";

  // Netlify injects geo data as x-nf-geo header
  const geoHeader = request.headers.get("x-nf-geo");
  if (geoHeader) {
    try {
      const geo = JSON.parse(geoHeader) as { city?: string };
      const mapped = geo.city ? CITY_MAP[geo.city] : undefined;
      if (mapped) detectedCity = mapped;
    } catch {
      // malformed header — keep fallback
    }
  }

  response.cookies.set("imbir-detected-city", detectedCity, {
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
