export type Procedure = {
  id: string;
  name: string;
  category: string;
  clinic: string;
  price: number;
  image?: string;
  reviews?: number;
};

export const MOCK_PROCEDURES: Procedure[] = [
  {
    id: "1",
    name: "Кардиология",
    category: "Кардиология",
    clinic: "Nova Clinic",
    price: 1700,
    reviews: 255,
  },
  {
    id: "2",
    name: "Биопсия",
    category: "Кардиология",
    clinic: "Nova Clinic",
    price: 1700,
    reviews: 255,
  },
  {
    id: "3",
    name: "УЗИ",
    category: "Кардиология",
    clinic: "Nova Clinic",
    price: 1700,
    reviews: 255,
  },
  {
    id: "4",
    name: "Консультация",
    category: "Кардиология",
    clinic: "Nova Clinic",
    price: 1700,
    reviews: 255,
  },
  {
    id: "5",
    name: "Ароматерапия",
    category: "Кардиология",
    clinic: "Nova Clinic",
    price: 1700,
    reviews: 255,
  },
  {
    id: "6",
    name: "УЗИ",
    category: "Кардиология",
    clinic: "Nova Clinic",
    price: 1700,
    reviews: 255,
  },
];
