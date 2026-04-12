export const ROUTES = {
  // Статичные страницы
  HOME: "/",
  CLINICS: "/clinics",
  SPECIALISTS: "/specialists",
  PROFILE: "/profile",
  CHATS: "/chat",
  VIDEOS: "/videos",

  // Динамические страницы (передаем ID)
  CLINIC_DETAILS: (id: string | number) => `/clinics/${id}`,
  SPECIALIST_DETAILS: (id: string | number) => `/specialists/${id}`,

  // Страницы с Query-параметрами (Search)
  SEARCH: (params?: { query?: string; category?: string }) => {
    if (!params) return "/search";

    const searchParams = new URLSearchParams();
    if (params.query) searchParams.append("q", params.query);
    if (params.category) searchParams.append("category", params.category);

    return `/search?${searchParams.toString()}`;
  },
} as const;
