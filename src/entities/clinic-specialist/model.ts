export type Specialist = {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  rating: number;
  reviews: number;
  experience: number;
  image?: string;
};

export const MOCK_SPECIALISTS: Specialist[] = [
  {
    id: "1",
    name: "Айбеков Нурлан Эльдарович",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
  },
  {
    id: "2",
    name: "Садыкова Алина Тимуровна",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
  },
  {
    id: "3",
    name: "Калиева Айгерим Бакытовна",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
  },
  {
    id: "4",
    name: "Калиева Айгерим Бакытовна",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
  },
  {
    id: "5",
    name: "Садыкова Алина Тимуровна",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
  },
  {
    id: "6",
    name: "Жумабаев Данияр Русланович",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
  },
];
