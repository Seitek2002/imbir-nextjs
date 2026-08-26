import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";
import perfectionist from "eslint-plugin-perfectionist";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { perfectionist },
    // Только type-level сортировка. Она стирается при компиляции, поэтому на
    // рантайм повлиять не может — единственный риск был бы косметический.
    //
    // sort-imports НЕ включаем: импорты уже расставляет
    // @trivago/prettier-plugin-sort-imports (см. .prettierrc), два
    // сортировщика подрались бы за один и тот же блок.
    //
    // sort-objects тоже не включаем: он трогает вообще все объектные
    // литералы, включая инлайновые в JSX, — это огромный дифф ради мелкой
    // пользы, и там уже есть порядок-зависимые места.
    //
    // Всё на warn: это подсказка при чтении типа, а не повод ронять CI.
    rules: {
      "perfectionist/sort-enums": ["warn", { type: "alphabetical" }],
      "perfectionist/sort-interfaces": ["warn", { type: "alphabetical" }],
      "perfectionist/sort-object-types": ["warn", { type: "alphabetical" }],
      "perfectionist/sort-union-types": ["warn", { type: "alphabetical" }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Локальный мок-сервер (CommonJS, не часть Next-приложения).
    "server/**",
  ]),
]);

export default eslintConfig;
