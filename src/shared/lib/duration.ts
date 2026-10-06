// Длительность услуги — целое число минут с бэка или null («не указана»;
// запись тогда считается 30-минутной, но пациенту это число не показываем).

export const MAX_SERVICE_DURATION = 24 * 60;

export const DURATION_INPUT_ERROR = `Длительность — целое число минут от 1 до ${MAX_SERVICE_DURATION}`;

export const hasDuration = (
  minutes: null | number | undefined,
): minutes is number => typeof minutes === "number" && minutes > 0;

// 45 → «45 мин», 60 → «1 ч», 90 → «1 ч 30 мин».
export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} мин`;
  return rest ? `${hours} ч ${rest} мин` : `${hours} ч`;
};

// «17:30» + 60 → «18:30».
const addMinutes = (time: string, minutes: number) => {
  const [h, m] = time.split(":").map(Number);
  const total = (h * 60 + m + minutes) % (24 * 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
};

// «17:30–18:30», если длительность известна, иначе просто «17:30».
export const formatTimeRange = (
  time: string,
  minutes: null | number | undefined,
) => {
  const start = time.slice(0, 5);
  return hasDuration(minutes)
    ? `${start}–${addMinutes(start, minutes)}`
    : start;
};

// Поле «Длительность, мин» в формах услуг: пусто → null (очистить),
// целое от 1 до суток → число, всё остальное → undefined (ошибка ввода).
export const parseDurationInput = (
  value: string,
): null | number | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return undefined;
  const minutes = Number(trimmed);
  return minutes >= 1 && minutes <= MAX_SERVICE_DURATION ? minutes : undefined;
};
