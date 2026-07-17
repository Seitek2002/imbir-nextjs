export const ROUTES = {
  // Статичные страницы
  HOME: "/",
  CLINICS: "/clinics",
  SPECIALISTS: "/specialists",
  PROFILE: "/profile",
  CHATS: "/chat",
  VIDEOS: "/videos",
  RECORD: "/record",
  SERVICES: "/services",
  BLOG: "/blog",

  // Авторизация
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",

  // Информационные страницы (футер)
  CONTACTS: "/contacts",
  TERMS: "/terms",
  PRIVACY: "/privacy",

  // Динамические страницы (передаем ID)
  CLINIC_DETAILS: (id: string | number) => `/clinics/${id}`,
  SPECIALIST_DETAILS: (id: string | number) => `/specialists/${id}`,
  BLOG_ARTICLE: (slug: string) => `/blog/${slug}`,

  // Страницы с Query-параметрами (Search)
  SEARCH: (params?: { query?: string; category?: string }) => {
    if (!params) return "/search";

    const searchParams = new URLSearchParams();
    if (params.query) searchParams.append("q", params.query);
    if (params.category) searchParams.append("category", params.category);

    return `/search?${searchParams.toString()}`;
  },

  // /record с предзаполненным врачом. Клиника: если известна явно (например,
  // мы уже на странице этой клиники) — передайте clinicId напрямую; иначе
  // передайте workplaces и она подставится сама, только если это
  // единственное место работы врача (иначе неоднозначно, пусть выберет сам
  // на странице записи).
  RECORD_FOR_DOCTOR: (
    doctorId: string | number,
    options?: {
      clinicId?: string;
      workplaces?: { clinicId: string }[];
      mode?: "online" | "offline";
    },
  ) => {
    const params = new URLSearchParams({ doctor: String(doctorId) });
    const clinicId =
      options?.clinicId ??
      (options?.workplaces?.length === 1
        ? options.workplaces[0].clinicId
        : undefined);
    if (clinicId) params.set("clinic", clinicId);
    if (options?.mode) params.set("mode", options.mode);
    return `/record?${params.toString()}`;
  },
} as const;
