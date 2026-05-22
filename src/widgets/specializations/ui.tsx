import Image from "next/image";
import Link from "next/link";

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
import { ROUTES } from "@/shared/config/routes";

const SPECIALIZATIONS = [
  { label: "ЛОР", image: ServiceLor, slug: "lor" },
  { label: "Неврология", image: ServiceNevrology, slug: "nevrology" },
  { label: "Гинекология", image: ServiceGinecology, slug: "ginecology" },
  { label: "Кардиология", image: ServiceCardiology, slug: "cardiology" },
  { label: "Пульмонология", image: ServicePulmonology, slug: "pulmonology" },
  {
    label: "Офтальмология",
    image: ServiceOphthalmology,
    slug: "ophthalmology",
  },
  {
    label: "Гастроэнтерология",
    image: ServiceGastroenterology,
    slug: "gastroenterology",
  },
  { label: "Стоматология", image: ServiceDentistry, slug: "dentistry" },
];

export const SpecializationsSection = () => {
  return (
    <section className="w-full max-w-360 mx-auto px-4 md:px-10 py-8 md:py-12">
      <div className="flex items-start justify-between mb-6 md:mb-8">
        <div>
          <h2 className="text-2xl md:text-[32px] font-bold text-[#191A1B] leading-tight">
            Специализации
          </h2>
          <p className="hidden md:block text-[#838A8D] text-base mt-1">
            Весь спектр услуг на одной площадке
          </p>
        </div>
        <Link
          href={ROUTES.SPECIALISTS}
          className="md:hidden text-[#F5653E] text-sm font-medium mt-1"
        >
          Все
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {SPECIALIZATIONS.map(({ label, image, slug }) => (
          <Link
            key={slug}
            href={`${ROUTES.SPECIALISTS}?specialization=${slug}`}
            className="group flex flex-col items-center gap-3 md:gap-4 p-4 md:p-6 bg-white border border-[#E5E6E8] rounded-2xl md:rounded-3xl hover:border-[#F5653E]/40 hover:shadow-sm transition-all duration-200"
          >
            <div className="relative w-20 h-20 md:w-28 md:h-28 shrink-0">
              <Image
                src={image}
                alt={label}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <span className="text-sm md:text-base font-medium text-[#191A1B] text-center leading-snug">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};
