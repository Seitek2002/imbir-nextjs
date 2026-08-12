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

// Тот же дефолт, что в shared/api/client.ts и next.config.ts.
const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://155.212.216.197:8030"
).replace(/\/$/, "");

// Часть media-ссылок бэк отдаёт абсолютными (фото врача, логотип клиники), а
// часть — относительными: author.avatar_url в /api/reviews/ приходит как
// "/media/users/avatars/xxx.webp". Относительный путь браузер разрешил бы
// относительно origin фронтенда и получил бы 404, поэтому дописываем хост API.
export const toMediaUrl = (
  url: string | null | undefined,
): string | undefined => {
  if (!url) return undefined;
  if (/^(https?:)?\/\//.test(url) || url.startsWith("data:"))
    return toHttps(url);
  return `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
};
