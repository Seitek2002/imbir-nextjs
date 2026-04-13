export type Service = {
  id: string;
  name: string;
  category: string;
  clinic: string;
  rating: number;
  reviews: number;
  price: number;
  image?: string;
};

export const MOCK_SERVICES: Service[] = [
  {
    id: "1",
    name: "Анализ крови",
    category: "Кардиология",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    price: 1700,
  },
  {
    id: "2",
    name: "Аудиометрия",
    category: "Кардиология",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    price: 1700,
  },
  {
    id: "3",
    name: "УЗИ",
    category: "Кардиология",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    price: 1700,
  },
  {
    id: "4",
    name: "Биопсия",
    category: "Кардиология",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    price: 1700,
  },
];
