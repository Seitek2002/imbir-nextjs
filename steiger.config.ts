import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    files: ["./src/shared/assets/**"],
    rules: {
      "fsd/no-public-api-sidestep": "off",
    },
  },
]);
