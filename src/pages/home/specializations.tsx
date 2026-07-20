import Image from "next/image";
import Link from "next/link";

import { SPECIALIZATIONS } from "@/shared/config";
import { ROUTES } from "@/shared/config";

export const SpecializationsSection = () => {
  return (
    <section className="w-full max-w-360 mx-auto px-4 md:px-10 pt-8 pb-0 md:py-12">
      <div className="flex items-start justify-between mb-6 md:mb-8">
        <div>
          <h2 className="text-2xl md:text-[32px] font-bold text-foreground leading-tight">
            Специализации
          </h2>
          <p className="hidden md:block text-muted text-base mt-1">
            Весь спектр услуг на одной площадке
          </p>
        </div>
        <Link
          href={ROUTES.SPECIALISTS}
          className="md:hidden text-primary text-sm font-medium mt-1"
        >
          Все
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {SPECIALIZATIONS.map(({ name, image }) => (
          <Link
            key={name}
            href={`${ROUTES.SPECIALISTS}?doc_spec=${encodeURIComponent(name)}`}
            className="group flex flex-col items-center gap-3 md:gap-4 p-4 md:p-6 bg-white border border-border rounded-2xl md:rounded-3xl hover:border-primary/40 hover:shadow-sm transition-all duration-200"
          >
            <div className="relative w-20 h-20 md:w-28 md:h-28 shrink-0">
              <Image
                src={image}
                alt={name}
                fill
                sizes="(min-width: 768px) 112px, 80px"
                className="object-contain group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <span className="text-sm md:text-base font-medium text-foreground text-center leading-snug">
              {name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};
