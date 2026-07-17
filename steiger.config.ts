import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // В assets публичные API держим раздельно: icons/ (svgr React-компоненты)
    // и images/ (строки-пути для <img src>). Импорт через под-сегмент
    // самодокументирует, как использовать ассет — компонент vs src.
    files: ["./src/shared/assets/**"],
    rules: {
      "fsd/public-api": "off",
      "fsd/no-public-api-sidestep": "off",
    },
  },
  {
    // Сайдбар кабинета пациента рендерится напрямую из корневого Next-роутинга
    // (app/profile/(cabinet)/layout.tsx) — так каркас с сайдбаром живёт в
    // layout и НЕ перемонтируется при переключении вкладок (плавный индикатор
    // меню). steiger сканирует только src и не видит этого потребителя из
    // app/, поэтому ошибочно считает слайс «без ссылок». Это не мёртвый код —
    // точечно отключаем insignificant-slice, не ломая архитектуру ради линтера.
    files: ["./src/widgets/profile/sidebar/**"],
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },
]);
