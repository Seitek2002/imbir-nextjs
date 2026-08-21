import toast from "react-hot-toast";

// Лимиты на вложения в анкетах и кабинетах. Раньше их не было вообще: фото с
// телефона на 23 МБ спокойно уходило в multipart, запрос не укладывался в
// таймаут, и вместе с фото терялись все текстовые поля, которые шли тем же
// запросом. Лимит нужен и как защита от такого, и просто чтобы аватар не весил
// больше самой страницы.
export const MAX_IMAGE_MB = 8;
export const MAX_DOCUMENT_MB = 15;

const MB = 1024 * 1024;

const formatMb = (bytes: number): string =>
  (bytes / MB).toFixed(bytes < MB ? 2 : 1);

// Возвращает true, если файл можно принять. При превышении сама показывает
// тост — вызывающему остаётся только не записывать файл в стейт.
export const isFileSizeAllowed = (file: File, maxMb: number): boolean => {
  if (file.size <= maxMb * MB) return true;
  toast.error(
    `«${file.name}» весит ${formatMb(file.size)} МБ — максимум ${maxMb} МБ. Выберите файл меньше.`,
  );
  return false;
};

// Отбор нескольких файлов сразу (сертификаты, документы, фото клиники):
// подходящие пропускаем, по каждому лишнему показываем свой тост.
export const filterAllowedFiles = (files: File[], maxMb: number): File[] =>
  files.filter((file) => isFileSizeAllowed(file, maxMb));
