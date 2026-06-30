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
]);
