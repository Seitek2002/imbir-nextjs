import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Не срезать завершающий слэш редиректом — иначе прокси к чату (/chat-api/*)
  // теряет слэш и Django-бэкенд отвечает ошибкой на POST.
  skipTrailingSlashRedirect: true,

  images: {
    formats: ["image/avif", "image/webp"],
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
        protocol: "http",
        hostname: "imbir.sino0on.ru",
        pathname: "/**",
      },
    ],
  },

  turbopack: {
    // Явно фиксируем корень проекта — иначе Next находит лишний lockfile
    // в домашней папке и выводит предупреждение про workspace root.
    root: __dirname,
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.tsx", // или '*.tsx', если хочешь типы React
      },
    },
  },

  // Прокси к чат-сервису: ходим с того же origin, чтобы браузер не блокировал
  // запросы CORS-ом (сам чат-бэкенд не отдаёт Access-Control-* заголовков) и
  // чтобы сессионная кука чата ставилась на наш домен.
  async rewrites() {
    const chatBase =
      process.env.NEXT_PUBLIC_CHAT_URL ?? "http://155.212.216.197:8054";
    return [
      {
        // (.*) сохраняет хвост дословно вместе с завершающим слэшем,
        // который :path* отбрасывает (Django требует слэш на POST).
        source: "/chat-api/:path(.*)",
        destination: `${chatBase}/:path`,
      },
    ];
  },
};

export default nextConfig;
