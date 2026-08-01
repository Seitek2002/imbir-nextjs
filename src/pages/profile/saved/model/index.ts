import type {
  FavoriteClinic,
  FavoriteDoctor,
  FavoriteService,
} from "@/shared/api";

export type SavedType = "doctor" | "clinic" | "service";

// /api/profile/favorites/ возвращает готовые данные карточек, поэтому
// сохранённое больше не дочитывается отдельным запросом на каждую запись.
export type SavedItem =
  | { type: "doctor"; data: FavoriteDoctor }
  | { type: "clinic"; data: FavoriteClinic }
  | { type: "service"; data: FavoriteService };
