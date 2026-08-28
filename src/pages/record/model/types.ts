import { StaticImageData } from "next/image";

type SelectionModalType = "clinic" | "doctor" | "service" | "workplace" | null;
type MobileStep = 1 | 2 | 3;
type MobileSelectionStage = "clinic" | "doctor" | "service" | "workplace";

type Clinic = {
  address: string;
  experience: number;
  id: string;
  image: StaticImageData | string;
  name: string;
  rating: number;
  reviews: number;
};

type Workplace = {
  clinicAddress?: string;
  clinicId: string;
  clinicName: string;
};

type Doctor = {
  clinicId: string;
  experience: number;
  id: string;
  image: StaticImageData | string;
  name: string;
  rating: number;
  reviews: number;
  specialty: string;
  workplaces: Workplace[];
};

type Service = {
  category: string;
  clinicId: string;
  // Название клиники берём напрямую из ответа API (см. use-record-form.ts),
  // а не через clinicMap.get(clinicId) — тот строится из отдельного,
  // постранично догружаемого списка клиник, где нужной клиники может ещё не
  // быть. Без этого поля две одноимённые услуги из разных клиник выглядели
  // неотличимо друг от друга.
  clinicName?: string;
  doctorIds: string[];
  id: string;
  image: StaticImageData | string;
  price: number;
  rating: number;
  reviews: number;
  title: string;
};

type SelectionItem = Clinic | Doctor | Service;

type OptionalFormErrors = {
  // Шаг 1: место приёма, специалист и услуга. Держим отдельно от submit,
  // чтобы подсветить сами поля, а не только строку внизу формы.
  clinic?: string;
  doctor?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  service?: string;
  submit?: string;
};
export type {
  SelectionModalType,
  MobileStep,
  MobileSelectionStage,
  SelectionItem,
  OptionalFormErrors,
  Clinic,
  Doctor,
  Service,
  Workplace,
};
