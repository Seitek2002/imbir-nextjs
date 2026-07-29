import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactCompiler: true,

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
