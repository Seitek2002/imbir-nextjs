export type WorkDaySchedule = {
  enabled: boolean;
  open: string;
  close: string;
};

export type ClinicScheduleData = {
  mon: WorkDaySchedule;
  tue: WorkDaySchedule;
  wed: WorkDaySchedule;
  thu: WorkDaySchedule;
  fri: WorkDaySchedule;
  sat: WorkDaySchedule;
  sun: WorkDaySchedule;
  lunchStart: string;
  lunchEnd: string;
  emergency24: boolean;
};

export type ClinicDocument = {
  name: string;
  url: string;
};

export type ClinicProfile = {
  id: string;

  // Основная информация
  name: string;
  logo?: string;
  type: string;
  description: string;
  photos: string[];

  // Локация и контакты
  country: string;
  city: string;
  fullAddress: string;
  phone: string;
  email: string;
  website: string;

  // Расписание
  workSchedule: ClinicScheduleData;

  // Юридическая информация
  legalName: string;
  registrationNumber: string;
  licenseNumber: string;
  licenseDate: string;
  licenseAuthority: string;
  documents: ClinicDocument[];

  // Специализация и услуги
  mainDirections: string[];
  narrowDirections: string[];
  additionalServices: string[];

  // Оборудование и условия
  equipment: string[];
  patientConditions: string[];
  paymentMethods: string[];

  rating?: number;
};
