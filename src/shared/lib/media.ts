// Бэк отдаёт media-ссылки (аватары, логотипы, фото) по http, хотя сам API и
// сайт работают по https, и тот же файл по https доступен. Пока это не
// починено на стороне бэка, приводим схему сами: иначе такие ссылки либо
// требуют http-исключения в remotePatterns (next.config.ts), либо — в обход
// next/image — блокируются браузером как mixed content.
export const toHttps = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  return url.replace(
    /^http:\/\/imbir\.sino0on\.ru/,
    "https://imbir.sino0on.ru",
  );
};
