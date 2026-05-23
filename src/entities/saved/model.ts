import {
  ClinicListItem,
  DoctorListItem,
  Schedule,
  ServiceItem,
} from "@/shared/constants/mocks";

export type SavedType = "doctor" | "clinic" | "service";

export type SavedItem =
  | {
      id: string;
      type: "doctor";
      savedAt: string;
      data: DoctorListItem;
    }
  | {
      id: string;
      type: "clinic";
      savedAt: string;
      data: ClinicListItem;
    }
  | {
      id: string;
      type: "service";
      savedAt: string;
      data: ServiceItem;
    };

// Пустой график-заглушка для моков (чтобы TS не ругался)
const dummySchedule: Schedule = {
  mon: null,
  tue: null,
  wed: null,
  thu: null,
  fri: null,
  sat: null,
  sun: null,
  lunchBreak: null,
};

export const MOCK_SAVED_ITEMS: SavedItem[] = [
  {
    id: "1",
    type: "doctor",
    savedAt: "2025-04-10",
    data: {
      id: "d1",
      name: "Айбеков Нурлан Эльдарович",
      specialty: "Врач-терапевт",
      workplaces: [
        {
          clinicId: "c1",
          clinicName: "Nova Clinic",
          price: 1500,
          schedule: dummySchedule,
        },
        {
          clinicId: "c2",
          clinicName: "Health Center",
          price: 1700,
          schedule: dummySchedule,
        },
      ],
      isOnlineAvailable: true,
      rating: 4.85,
      reviews: 255,
      experience: 12,
    },
  },
  {
    id: "2",
    type: "doctor",
    savedAt: "2025-04-09",
    data: {
      id: "d2",
      name: "Садыкова Алина Тимуровна",
      specialty: "Врач-терапевт",
      workplaces: [
        {
          clinicId: "c1",
          clinicName: "Nova Clinic",
          price: 1500,
          schedule: dummySchedule,
        },
      ],
      isOnlineAvailable: false,
      rating: 4.85,
      reviews: 255,
      experience: 12,
    },
  },
  {
    id: "3",
    type: "clinic",
    savedAt: "2025-04-08",
    data: {
      id: "c1",
      name: "Nova Clinic",
      address: "ул. Московская, 189",
      rating: 4.85,
      reviews: 255,
      experience: 12,
      specialties: ["Терапия", "Кардиология"], // Обязательное поле для клиники
    },
  },
  {
    id: "4",
    type: "service",
    savedAt: "2025-04-07",
    data: {
      id: "s1",
      name: "Анализ крови",
      category: "Кардиология",
      clinicId: "c1",
      clinicName: "МЦ «Медика»",
      rating: 4.85,
      reviews: 255,
      price: 1700,
      image: "https://placehold.co/400x300/E3E4E5/838A8D.png?text=Lab",
      schedule: dummySchedule,
      doctorIds: ["d1", "d2"],
    },
  },
];
