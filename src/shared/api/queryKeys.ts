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
  detail: (id: string | number) => [...doctorKeys.details(), id] as const,
};

export const clinicKeys = {
  all: ["clinics"] as const,
  lists: () => [...clinicKeys.all, "list"] as const,
  list: (filters: object) => [...clinicKeys.lists(), filters] as const,
  details: () => [...clinicKeys.all, "detail"] as const,
  detail: (id: string | number) => [...clinicKeys.details(), id] as const,
};

export const serviceKeys = {
  all: ["services"] as const,
  lists: () => [...serviceKeys.all, "list"] as const,
  list: (filters: object) => [...serviceKeys.lists(), filters] as const,
  details: () => [...serviceKeys.all, "detail"] as const,
  detail: (id: string | number) => [...serviceKeys.details(), id] as const,
};

export const reviewKeys = {
  all: ["reviews"] as const,
  byTarget: (type: string, id: string | number) =>
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
  doctors: () => [...clinicCabinetKeys.all, "doctors"] as const,
  services: () => [...clinicCabinetKeys.all, "services"] as const,
  appointments: (filters: object) =>
    [...clinicCabinetKeys.all, "appointments", filters] as const,
  stats: () => [...clinicCabinetKeys.all, "stats"] as const,
  invites: () => [...clinicCabinetKeys.all, "invites"] as const,
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
};

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
};

export const chatKeys = {
  all: ["chat"] as const,
  rooms: () => [...chatKeys.all, "rooms"] as const,
  messages: (roomId: number) => [...chatKeys.all, "messages", roomId] as const,
  ai: () => [...chatKeys.all, "ai"] as const,
};
