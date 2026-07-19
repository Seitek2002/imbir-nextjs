import type { CapacitorConfig } from "@capacitor/cli";

// Наш Next.js использует SSR (динамические страницы, куки для определения
// города, серверный префетч данных и т.д.) — под статический экспорт
// (next export / output: "export") он не подходит без отдельной большой
// переделки. Поэтому нативная оболочка не бандлит статику из webDir, а
// просто открывает во WebView живой сайт через server.url — webDir/www всё
// равно нужен Capacitor'у как формальность (см. www/index.html).
const config: CapacitorConfig = {
  appId: "com.imbir.app",
  appName: "Imbir",
  webDir: "www",
  server: {
    url: "https://imbir.me",
    androidScheme: "https",
    cleartext: false,
  },
};

export default config;
