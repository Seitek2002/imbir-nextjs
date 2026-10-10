export type WorkDaySchedule = {
  close: string;
  enabled: boolean;
  open: string;
};

export type ClinicScheduleData = {
  emergency24: boolean;
  fri: WorkDaySchedule;
  lunchEnd: string;
  lunchStart: string;
  mon: WorkDaySchedule;
  sat: WorkDaySchedule;
  sun: WorkDaySchedule;
  thu: WorkDaySchedule;
  tue: WorkDaySchedule;
  wed: WorkDaySchedule;
};

export type ClinicDocument = {
  // id с бэка — нужен для удаления; в старых местах документы бывают без него
  id?: number;
  name: string;
  url: string;
};

export type ClinicPhotoItem = {
  id: number;
  url: string;
};

export type ClinicProfile = {
  additionalServices: string[];

  city: string;
  // Локация и контакты
  country: string;
  description: string;
  documents: ClinicDocument[];
  email: string;

  // Оборудование и условия
  equipment: string[];
  // Стаж клиники, лет — по нему работает фильтр «Стаж» в каталоге клиник
  experienceYears?: number;
  fullAddress: string;
  id: string;
  latitude: string;
  // Юридическая информация
  legalName: string;
  licenseAuthority: string;
  licenseDate: string;
  licenseNumber: string;

  logo?: string;

  longitude: string;
  // Специализация и услуги
  mainDirections: string[];
  // Основная информация
  name: string;
  narrowDirections: string[];
  patientConditions: string[];
  paymentMethods: string[];

  phone: string;
  photos: string[];
  rating?: number;

  registrationNumber: string;
  type: string;
  website: string;

  // Расписание
  workSchedule: ClinicScheduleData;
};

// Сайт без схемы («imbir.kg») бэк (URLField) отклоняет 400-й ошибкой на всё
// сохранение профиля — дописываем https:// сами, как и бэк в новых версиях.
export const normalizeWebsite = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed.replace(/^\/+/, "")}`;
};

// Координаты из Google Maps приходят с 14 знаками после запятой, а бэк
// (DecimalField(9, 6)) принимает не больше 6. Пустое поле — null, чтобы
// очищенная координата действительно стиралась. Нечисловое значение
// отправляем как есть: бэк вернёт ошибку с названием поля.
export const normalizeCoordinate = (value: string): null | string => {
  const trimmed = value.trim().replace(",", ".");
  if (!trimmed) return null;
  const number = Number(trimmed);
  return Number.isFinite(number) ? number.toFixed(6) : trimmed;
};
