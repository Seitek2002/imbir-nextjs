import type { StaticImageData } from "next/image";

import {
  ServiceCardiology,
  ServiceDentistry,
  ServiceGastroenterology,
  ServiceGinecology,
  ServiceLor,
  ServiceNevrology,
  ServiceOphthalmology,
  ServicePulmonology,
} from "@/shared/assets";

export type Specialization = {
  name: string;
  image: StaticImageData;
};

export const SPECIALIZATIONS: Specialization[] = [
  { name: "ЛОР", image: ServiceLor },
  { name: "Неврология", image: ServiceNevrology },
  { name: "Гинекология", image: ServiceGinecology },
  { name: "Кардиология", image: ServiceCardiology },
  { name: "Пульмонология", image: ServicePulmonology },
  { name: "Офтальмология", image: ServiceOphthalmology },
  { name: "Гастроэнтерология", image: ServiceGastroenterology },
  { name: "Стоматология", image: ServiceDentistry },
];
