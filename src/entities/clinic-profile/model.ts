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

const wd = (
  open = "09:00",
  close = "18:00",
  enabled = true,
): WorkDaySchedule => ({ enabled, open, close });

export const MOCK_CLINIC_PROFILE: ClinicProfile = {
  id: "1",

  name: "K-MED",
  logo: "/clinic-logo.png",
  type: "Частная",
  description:
    "Наша клиника — это современная медицинская помощь, опытные врачи и индивидуальный подход к каждому пациенту. Мы используем проверенные методы и технологии, чтобы обеспечить точную диагностику, эффективное лечение и комфорт на каждом этапе заботы о вашем здоровье.",
  photos: [
    "/clinic-photo-1.jpg",
    "/clinic-photo-2.jpg",
    "/clinic-photo-3.jpg",
    "/clinic-photo-4.jpg",
  ],

  country: "Кыргызстан",
  city: "Бишкек",
  fullAddress: "ул. Тыныстанова, 189",
  phone: "+996 500 123 456",
  email: "kmed@gmail.com",
  website: "www.kmed.com",

  workSchedule: {
    mon: wd(),
    tue: wd(),
    wed: wd(),
    thu: wd(),
    fri: wd(),
    sat: wd("09:00", "14:00", false),
    sun: wd("09:00", "14:00", false),
    lunchStart: "12:00",
    lunchEnd: "13:00",
    emergency24: true,
  },

  legalName: 'ОсОО "К-Med"',
  registrationNumber: "123 456 789",
  licenseNumber: "ЛИЦ-123456",
  licenseDate: "12.12.2021",
  licenseAuthority: "Минздрав КР",
  documents: [
    { name: "file-name.pdf", url: "#" },
    { name: "file-name.doc", url: "#" },
    { name: "file-name.doc", url: "#" },
  ],

  mainDirections: ["Терапия", "Кардиология", "Педиатрия"],
  narrowDirections: ["Эндокринолог", "Невролог", "Офтальмолог"],
  additionalServices: ["Анализы", "УЗИ", "Рентген"],

  equipment: ["УЗИ", "Операционная", "Рентген", "Лаборатория"],
  patientConditions: [
    "Парковка",
    "Онлайн-консультация",
    "Доступ для инвалидов",
    "Аптека",
  ],
  paymentMethods: ["Наличные", "Онлайн"],

  rating: 4.85,
};
