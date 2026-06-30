import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Слой страниц называется `screens`: имя `pages` зарезервировано Next.js
    // под Pages Router и ломает `next build`. Steiger не распознаёт `screens`
    // как слой, поэтому не видит ссылки из страниц в нижние слои и выдаёт
    // ложные «insignificant-slice» для слайсов, используемых только со страниц.
    // Правило ненадёжно, пока слой не распознаётся, — отключаем.
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },
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
]);
