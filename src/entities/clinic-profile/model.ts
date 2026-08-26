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
  name: string;
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
