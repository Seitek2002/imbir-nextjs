"use client";

import { FC } from "react";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import { getSearchSuggestions, searchKeys } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { ImageWithFallback } from "@/shared/ui";
import { Spinner } from "@/shared/ui";

type RowProps = {
  href: string;
  image: null | string;
  onNavigate: () => void;
  subtitle: string;
  title: string;
};

const Row: FC<RowProps> = ({ href, image, title, subtitle, onNavigate }) => (
  <Link
    href={href}
    onClick={onNavigate}
    className="flex items-center gap-3 px-4 py-2.5 hover:bg-background transition-colors"
  >
    <div className="relative size-10 rounded-full overflow-hidden bg-background shrink-0">
      <ImageWithFallback
        src={image}
        alt={title}
        fill
        sizes="40px"
        className="object-cover"
        fallback={
          <div className="size-full flex items-center justify-center text-secondary text-xs font-semibold uppercase">
            {title.slice(0, 2)}
          </div>
        }
      />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-medium text-foreground truncate">{title}</p>
      <p className="text-xs text-secondary truncate">{subtitle}</p>
    </div>
  </Link>
);

const GroupLabel: FC<{ label: string }> = ({ label }) => (
  <p className="px-4 py-1 text-xs font-medium text-secondary uppercase">
    {label}
  </p>
);

export const SearchSuggestions: FC<{
  onNavigate: () => void;
  query: string;
}> = ({ query, onNavigate }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: searchKeys.suggest(query),
    queryFn: () => getSearchSuggestions(query),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner className="size-6 text-primary" />
      </div>
    );
  }

  const doctors = data?.doctors ?? [];
  const clinics = data?.clinics ?? [];
  const services = data?.services ?? [];
  const hasResults = doctors.length + clinics.length + services.length > 0;

  if (isError || !hasResults) {
    return (
      <p className="text-sm text-muted text-center py-6">
        {isError ? "Не удалось получить подсказки" : "Ничего не найдено"}
      </p>
    );
  }

  return (
    <div className="py-2">
      {doctors.length > 0 && (
        <div className="mb-2">
          <GroupLabel label="Врачи" />
          {doctors.map((doctor) => (
            <Row
              key={`doctor-${doctor.id}`}
              href={ROUTES.SPECIALIST_DETAILS(doctor.id)}
              image={doctor.photo}
              title={doctor.full_name}
              subtitle={doctor.specialty}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}

      {clinics.length > 0 && (
        <div className="mb-2">
          <GroupLabel label="Клиники" />
          {clinics.map((clinic) => (
            <Row
              key={`clinic-${clinic.id}`}
              href={ROUTES.CLINIC_DETAILS(clinic.id)}
              image={clinic.logo}
              title={clinic.name}
              subtitle="Клиника"
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}

      {services.length > 0 && (
        <div>
          <GroupLabel label="Услуги" />
          {services.map((service) => (
            <Row
              key={`service-${service.id}`}
              href={ROUTES.SEARCH({ query: service.name })}
              image={null}
              title={service.name}
              subtitle={service.category}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
};
