import { StaticImageData } from "next/image";

type SelectionModalType = "clinic" | "doctor" | "workplace" | "service" | null;
type MobileStep = 1 | 2 | 3;
type MobileSelectionStage = "clinic" | "doctor" | "workplace" | "service";

type Clinic = {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  experience: number;
  address: string;
  image: StaticImageData | string;
};

type Workplace = {
  clinicId: string;
  clinicName: string;
  clinicAddress?: string;
};

type Doctor = {
  id: string;
  clinicId: string;
  workplaces: Workplace[];
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: number;
  image: StaticImageData | string;
};

type Service = {
  id: string;
  clinicId: string;
  doctorIds: string[];
  title: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: StaticImageData | string;
};

type SelectionItem = Clinic | Doctor | Service;

type OptionalFormErrors = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
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
