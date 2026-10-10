/**
 * Форматирование даты и времени записей.
 *
 * Бэк отдаёт их как есть из БД: дату — ISO-строкой `2026-05-06`, время —
 * `10:00:00`. Раньше каждая страница кабинета приводила их к человеческому
 * виду сама (три копии одних и тех же четырёх строк), а список записей клиники
 * не приводил вовсе и показывал «2026-05-06 10:00:00».
 */

/**
 * `2026-05-06` → `06.05.2026`. Непонятную строку возвращаем как есть.
 *
 * `emptyAs` — что показать вместо пустой даты. В записях дата есть всегда,
 * а вот в списке пациентов «последний визит» может быть пустым — там нужен прочерк.
 */
export const fmtDate = (iso: string, emptyAs = ""): string => {
  const parts = iso?.split("-");
  if (parts?.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
  return iso || emptyAs;
};

/** `10:00:00` → `10:00`. */
export const fmtTime = (time: string): string =>
  time?.length >= 5 ? time.slice(0, 5) : time;

/**
 * Часовой пояс площадки: время записей на бэке — местное бишкекское
 * (TIME_ZONE), и «сегодня» для записи считается по нему, а не по часам
 * браузера.
 */
export const BOOKING_TIME_ZONE = "Asia/Bishkek";

/**
 * `2026-05-06` → локальная полночь 6 мая. `new Date("2026-05-06")` разбирает
 * такую строку как полночь по UTC, и западнее Гринвича получалось 5 мая.
 * Непонятную строку — null.
 */
export const parseLocalDate = (iso: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Сегодняшний день в Бишкеке — локальной полночью, чтобы сравнивать с днями
 * календаря. По часам браузера у пациента из другого пояса «сегодня» уезжало
 * на день: он видел доступным уже прошедший в Бишкеке день или не мог выбрать
 * сегодняшний.
 */
export const todayInBookingZone = (): Date => {
  const now = new Date();
  try {
    // en-CA форматирует как YYYY-MM-DD.
    const iso = new Intl.DateTimeFormat("en-CA", {
      timeZone: BOOKING_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
    const parsed = parseLocalDate(iso);
    if (parsed) return parsed;
  } catch {
    // Браузер без базы часовых поясов — считаем по местным часам.
  }
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};
