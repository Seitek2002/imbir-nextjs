// Centralized query key factory.
// Usage: doctorKeys.list({ city: "Бишкек" }), doctorKeys.detail("1")
// Enables precise invalidation: queryClient.invalidateQueries({ queryKey: doctorKeys.all })

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export const doctorKeys = {
  all: ["doctors"] as const,
  lists: () => [...doctorKeys.all, "list"] as const,
  list: (filters: object) => [...doctorKeys.lists(), filters] as const,
  details: () => [...doctorKeys.all, "detail"] as const,
  detail: (id: number | string) => [...doctorKeys.details(), id] as const,
};

export const clinicKeys = {
  all: ["clinics"] as const,
  lists: () => [...clinicKeys.all, "list"] as const,
  list: (filters: object) => [...clinicKeys.lists(), filters] as const,
  details: () => [...clinicKeys.all, "detail"] as const,
  detail: (id: number | string) => [...clinicKeys.details(), id] as const,
};

export const serviceKeys = {
  all: ["services"] as const,
  lists: () => [...serviceKeys.all, "list"] as const,
  list: (filters: object) => [...serviceKeys.lists(), filters] as const,
  details: () => [...serviceKeys.all, "detail"] as const,
  detail: (id: number | string) => [...serviceKeys.details(), id] as const,
};

export const searchKeys = {
  all: ["search"] as const,
  suggest: (query: string) => [...searchKeys.all, "suggest", query] as const,
};

export const reviewKeys = {
  all: ["reviews"] as const,
  byTarget: (type: string, id: number | string) =>
    [...reviewKeys.all, type, id] as const,
};

export const appointmentKeys = {
  all: ["appointments"] as const,
};

export const profileKeys = {
  all: ["profile"] as const,
  me: () => [...profileKeys.all, "me"] as const,
  appointments: (filters: object) =>
    [...profileKeys.all, "appointments", filters] as const,
  favorites: () => [...profileKeys.all, "favorites"] as const,
  reviews: () => [...profileKeys.all, "reviews"] as const,
};

export const doctorCabinetKeys = {
  all: ["doctor-cabinet"] as const,
  profile: () => [...doctorCabinetKeys.all, "profile"] as const,
  schedule: () => [...doctorCabinetKeys.all, "schedule"] as const,
  appointments: (filters: object) =>
    [...doctorCabinetKeys.all, "appointments", filters] as const,
  patients: (filters: object) =>
    [...doctorCabinetKeys.all, "patients", filters] as const,
  stats: () => [...doctorCabinetKeys.all, "stats"] as const,
  reviews: () => [...doctorCabinetKeys.all, "reviews"] as const,
  services: () => [...doctorCabinetKeys.all, "services"] as const,
};

export const clinicCabinetKeys = {
  all: ["clinic-cabinet"] as const,
  profile: () => [...clinicCabinetKeys.all, "profile"] as const,
  documents: () => [...clinicCabinetKeys.all, "documents"] as const,
  photos: () => [...clinicCabinetKeys.all, "photos"] as const,
  doctors: () => [...clinicCabinetKeys.all, "doctors"] as const,
  doctor: (id: number) => [...clinicCabinetKeys.all, "doctor", id] as const,
  doctorDocuments: (id: number) =>
    [...clinicCabinetKeys.all, "doctor", id, "documents"] as const,
  services: () => [...clinicCabinetKeys.all, "services"] as const,
  service: (id: number) => [...clinicCabinetKeys.all, "service", id] as const,
  appointments: (filters: object) =>
    [...clinicCabinetKeys.all, "appointments", filters] as const,
  stats: () => [...clinicCabinetKeys.all, "stats"] as const,
  invites: () => [...clinicCabinetKeys.all, "invites"] as const,
  reviews: () => [...clinicCabinetKeys.all, "reviews"] as const,
};

export const blogKeys = {
  all: ["blog"] as const,
  lists: () => [...blogKeys.all, "list"] as const,
  list: (filters: object) => [...blogKeys.lists(), filters] as const,
  categories: () => [...blogKeys.all, "categories"] as const,
  detail: (slug: string) => [...blogKeys.all, "detail", slug] as const,
};

export const referenceKeys = {
  all: ["references"] as const,
  cities: () => [...referenceKeys.all, "cities"] as const,
  specializations: () => [...referenceKeys.all, "specializations"] as const,
  clinicTypes: () => [...referenceKeys.all, "clinicTypes"] as const,
  languages: () => [...referenceKeys.all, "languages"] as const,
  equipment: () => [...referenceKeys.all, "equipment"] as const,
  conditions: () => [...referenceKeys.all, "conditions"] as const,
  paymentMethods: () => [...referenceKeys.all, "paymentMethods"] as const,
  countryCodes: () => [...referenceKeys.all, "countryCodes"] as const,
  serviceCategories: () => [...referenceKeys.all, "serviceCategories"] as const,
  // Префикс без id — по нему сбрасывается кэш статуса после изменения отзывов.
  userStatuses: () => [...referenceKeys.all, "userStatus"] as const,
  userStatus: (userId: number) =>
    [...referenceKeys.userStatuses(), userId] as const,
};

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
};

export const chatKeys = {
  all: ["chat"] as const,
  rooms: () => [...chatKeys.all, "rooms"] as const,
  unreadCount: () => [...chatKeys.all, "unread-count"] as const,
  messages: (roomId: number) => [...chatKeys.all, "messages", roomId] as const,
  ai: () => [...chatKeys.all, "ai"] as const,
  // Итоги созвонов с конкретным собеседником (см. getConsultationSummaries).
  summaries: (partnerUserId: number) =>
    [...chatKeys.all, "summaries", partnerUserId] as const,
};
