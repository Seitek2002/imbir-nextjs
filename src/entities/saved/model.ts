export type SavedType = "doctor" | "clinic" | "service";

type Workplace = {
  clinicId: string;
  clinicName: string;
  price: number;
};

type DoctorData = {
  id: string;
  name: string;
  specialty: string;
  workplaces: Workplace[];
  isOnlineAvailable?: boolean;
  rating: number;
  reviews: number;
  experience: number;
  image?: string;
};

type ClinicData = {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  experience: number;
  image?: string;
};

type ServiceData = {
  id: string;
  name: string;
  category: string;
  clinic: string;
  rating: number;
  reviews: number;
  price: number;
  image?: string;
};

export type SavedItem =
  | {
      id: string;
      type: "doctor";
      savedAt: string;
      data: DoctorData;
    }
  | {
      id: string;
      type: "clinic";
      savedAt: string;
      data: ClinicData;
    }
  | {
      id: string;
      type: "service";
      savedAt: string;
      data: ServiceData;
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
        { clinicId: "c1", clinicName: "Nova Clinic", price: 1500 },
        { clinicId: "c2", clinicName: "Health Center", price: 1700 },
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
      workplaces: [{ clinicId: "c1", clinicName: "Nova Clinic", price: 1500 }],
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
      clinic: "Nova Clinic",
      rating: 4.85,
      reviews: 255,
      price: 1700,
    },
  },
];
