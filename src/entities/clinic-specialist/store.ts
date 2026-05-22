import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SpecialistFormData = {
  fullName: string;
  gender: string;
  birthDate: string;
  city: string;
  languages: string;
  phone: string;
  email: string;
  photo: string;
  specialty: string;
  additionalSpecialty: string;
  experienceYears: string;
  currentPosition: string;
  workplace: string;
  qualification: string;
  scientificDegree: string;
  university: string;
  graduationYear: string;
  internship: string;
  residency: string;
  diplomaSpecialty: string;
  additionalEducation: string[];
  licenseNumber: string;
};

export type SpecialistFull = SpecialistFormData & {
  id: string;
  certificates: string[];
  rating: number;
  reviews: number;
};

export const EMPTY_SPECIALIST_FORM: SpecialistFormData = {
  fullName: "",
  gender: "",
  birthDate: "",
  city: "",
  languages: "",
  phone: "",
  email: "",
  photo: "",
  specialty: "",
  additionalSpecialty: "",
  experienceYears: "",
  currentPosition: "",
  workplace: "",
  qualification: "",
  scientificDegree: "",
  university: "",
  graduationYear: "",
  internship: "",
  residency: "",
  diplomaSpecialty: "",
  additionalEducation: [],
  licenseNumber: "",
};

const INITIAL: SpecialistFull[] = [
  {
    id: "1",
    fullName: "Айбеков Нурлан Эльдарович",
    gender: "Мужской",
    birthDate: "15.03.1985",
    city: "Бишкек",
    languages: "Русский, Кыргызский",
    phone: "+996 700 111 222",
    email: "aybekov@kmed.kg",
    photo: "",
    specialty: "Терапевт",
    additionalSpecialty: "Кардиолог",
    experienceYears: "12",
    currentPosition: "Врач-терапевт",
    workplace: "K-MED",
    qualification: "Высшая",
    scientificDegree: "",
    university: "КГМА им. И.К. Ахунбаева",
    graduationYear: "2008",
    internship: "Терапия",
    residency: "",
    diplomaSpecialty: "Лечебное дело",
    additionalEducation: ["Повышение квалификации по терапии, 2019"],
    licenseNumber: "ЛИЦ-100001",
    certificates: [],
    rating: 4.85,
    reviews: 255,
  },
  {
    id: "2",
    fullName: "Садыкова Алия Темировна",
    gender: "Женский",
    birthDate: "12.12.2001",
    city: "Бишкек",
    languages: "Русский, Английский",
    phone: "+996 500 123 456",
    email: "dr.sadykova@gmail.com",
    photo: "",
    specialty: "Терапевт",
    additionalSpecialty: "Кардиолог",
    experienceYears: "15",
    currentPosition: "Главный врач",
    workplace: "K-MED",
    qualification: "Высшая",
    scientificDegree: "Кандидат медицинских наук",
    university: "КРСУ им. Б.Н. Ельцина",
    graduationYear: "2010",
    internship: "Терапия",
    residency: "Кардиология",
    diplomaSpecialty: "Лечебное дело",
    additionalEducation: [
      "Курс по кардиологии, 2015",
      "Повышение квалификации, 2020",
    ],
    licenseNumber: "ЛИЦ-123456",
    certificates: [],
    rating: 4.9,
    reviews: 312,
  },
  {
    id: "3",
    fullName: "Калиева Айгерим Бакытовна",
    gender: "Женский",
    birthDate: "20.07.1990",
    city: "Бишкек",
    languages: "Русский",
    phone: "+996 770 333 444",
    email: "kalieva@kmed.kg",
    photo: "",
    specialty: "Кардиолог",
    additionalSpecialty: "",
    experienceYears: "14",
    currentPosition: "Врач-кардиолог",
    workplace: "K-MED",
    qualification: "Первая",
    scientificDegree: "",
    university: "КГМА им. И.К. Ахунбаева",
    graduationYear: "2013",
    internship: "Кардиология",
    residency: "Кардиология",
    diplomaSpecialty: "Лечебное дело",
    additionalEducation: [
      "Курс ЭКГ-диагностики, 2017",
      "Эхокардиография, 2021",
    ],
    licenseNumber: "ЛИЦ-100003",
    certificates: [],
    rating: 4.8,
    reviews: 198,
  },
  {
    id: "4",
    fullName: "Жумабаев Данияр Русланович",
    gender: "Мужской",
    birthDate: "03.11.1988",
    city: "Бишкек",
    languages: "Русский, Кыргызский, Английский",
    phone: "+996 550 555 666",
    email: "zhumabaev@kmed.kg",
    photo: "",
    specialty: "Невролог",
    additionalSpecialty: "Психиатр",
    experienceYears: "9",
    currentPosition: "Врач-невролог",
    workplace: "K-MED",
    qualification: "Первая",
    scientificDegree: "",
    university: "КРСУ им. Б.Н. Ельцина",
    graduationYear: "2012",
    internship: "Неврология",
    residency: "",
    diplomaSpecialty: "Лечебное дело",
    additionalEducation: [],
    licenseNumber: "ЛИЦ-100004",
    certificates: [],
    rating: 4.75,
    reviews: 143,
  },
];

type StoreState = {
  specialists: SpecialistFull[];
  add: (data: SpecialistFormData & { certificates: string[] }) => string;
  update: (
    id: string,
    data: SpecialistFormData & { certificates: string[] },
  ) => void;
  remove: (id: string) => void;
};

export const useSpecialistsStore = create<StoreState>()(
  persist(
    (set) => ({
      specialists: INITIAL,
      add: (data) => {
        const id = Date.now().toString();
        set((state) => ({
          specialists: [
            ...state.specialists,
            { ...data, id, rating: 0, reviews: 0 },
          ],
        }));
        return id;
      },
      update: (id, data) =>
        set((state) => ({
          specialists: state.specialists.map((s) =>
            s.id === id ? { ...s, ...data } : s,
          ),
        })),
      remove: (id) =>
        set((state) => ({
          specialists: state.specialists.filter((s) => s.id !== id),
        })),
    }),
    { name: "clinic-specialists" },
  ),
);
