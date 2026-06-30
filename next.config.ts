import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

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
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.tsx", // или '*.tsx', если хочешь типы React
      },
    },
  },
};

export default nextConfig;
