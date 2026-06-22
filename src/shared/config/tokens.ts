export const colors = {
  // Brand
  primary: "#F5653E", // основной оранжевый — кнопки, акценты
  primaryDark: "#E5542D", // темнее primary — hover-состояния
  primaryTint: "#FFF8F5", // очень светлый primary — фоны акцентных блоков

  // Text
  foreground: "#191A1B", // основной текст
  secondary: "#686F72", // вторичный текст
  muted: "#838A8D", // приглушённый текст
  dim: "#C4C8CA", // плейсхолдеры, очень приглушённое

  // Surfaces
  background: "#F2F3F5", // фон страницы
  surface: "#F8F9FA", // фон карточек/блоков

  // Borders
  border: "#E5E6E8", // основная граница
  borderSoft: "#E3E4E5", // мягкая граница

  // Overlay
  overlay: "#0D0D12", // тёмный оверлей под модалками
} as const;

export type ColorToken = keyof typeof colors;
