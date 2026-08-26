import type {
  FavoriteClinic,
  FavoriteDoctor,
  FavoriteService,
} from "@/shared/api";

export type SavedType = "clinic" | "doctor" | "service";

// /api/profile/favorites/ возвращает готовые данные карточек, поэтому
// сохранённое больше не дочитывается отдельным запросом на каждую запись.
export type SavedItem =
  | { data: FavoriteClinic; type: "clinic" }
  | { data: FavoriteDoctor; type: "doctor" }
  | { data: FavoriteService; type: "service" };
