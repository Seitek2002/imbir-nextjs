import type { NextConfig } from "next";

import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const backendUrl = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://155.212.216.197:8030"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  // React Compiler — это отдельный проход Babel по каждому файлу с
  // компонентами (297 .tsx), а под Turbopack webpack-лоадеры выполняются не
  // в процессе сервера, а в пуле дочерних нодов. В dev это стоило 1.8 ГБ и
  // семи лишних процессов из 4.5 ГБ, которые занимало дерево dev-сервера
  // (замерено на 12 маршрутах: 15 процессов / 4518 МБ против 8 / 2726 МБ).
  // Оптимизация нужна на проде, а не при разработке, поэтому включаем её
  // только в сборке.
  //
  // Плата: dev и прод расходятся по мемоизации. Если баг зависит от того,
  // перерисовался компонент или нет, в dev его может не быть, а на проде —
  // быть (и наоборот). Такое проверяем на `next build && next start`,
  // а не только в dev.
  reactCompiler: process.env.NODE_ENV === "production",

  // Файлы отправляем через тот же origin, что и фронтенд: браузер не блокирует
  // multipart по CORS, а все запросы по-прежнему идут через общий Axios-клиент.
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },

  experimental: {
    // Старый обработчик скролла ищет первый DOM-узел сегмента через
    // findDOMNode и упирается в метаданные, которые React поднимает в <head>:
    // они нулевого размера, обработчик проходит по их siblings, не находит
    // ничего подходящего и молча выходит — страница открывается не с верха, а
    // с той позиции, где браузер обрезал прежний скролл. Новый обработчик
    // меряет весь фрагмент сегмента и такой проблемы не имеет.
    appNewScrollHandler: true,
  },

  images: {
    formats: ["image/avif", "image/webp"],
    // Next.js 16 whitelists quality values; 55 — hero background (see
    // src/pages/home/hero.tsx), 75 — the default used everywhere else.
    qualities: [55, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pravatar.cc",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "155.212.216.197",
        port: "8030",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "imbir.sino0on.ru",
        pathname: "/**",
      },
      {
        // API отдаёт media-URL по http (аватары/фото) — иначе next/image
        // отклоняет ссылку и картинка не отображается
        protocol: "http",
        hostname: "imbir.sino0on.ru",
        pathname: "/**",
      },
    ],
  },

  turbopack: {
    // Без явного root Next ищет lockfile вверх по дереву и находит
    // ~/package-lock.json — за корень воркспейса берётся домашняя папка.
    root: __dirname,
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.tsx", // или '*.tsx', если хочешь типы React
      },
    },
  },
};

export default withBundleAnalyzer(nextConfig);
