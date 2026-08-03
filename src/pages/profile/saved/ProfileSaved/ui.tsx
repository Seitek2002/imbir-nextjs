"use client";

import { FC, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useFavoriteToggle } from "@/features/favorite-toggle";

import { ClinicCard } from "@/entities/clinic";
import { DoctorCard } from "@/entities/doctor";
import { ServiceCard } from "@/entities/service";

import { ROUTES } from "@/shared/config";
import type { Schedule } from "@/shared/dummies";
import { parsePrice } from "@/shared/lib/price";

import { SavedItem, SavedType } from "../model";

type Props = {
  items: SavedItem[];
  activeTab: SavedType;
};

const toRating = (value?: string | null) => {
  if (!value) return undefined;
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

// DoctorCard ждёт полноценный Workplace (со schedule) только чтобы прочитать
// clinicName — расписание в избранном не нужно и не приходит.
const EMPTY_SCHEDULE: Schedule = {
  mon: null,
  tue: null,
  wed: null,
  thu: null,
  fri: null,
  sat: null,
  sun: null,
  lunchBreak: null,
};

export const ProfileSaved: FC<Props> = ({ items, activeTab }) => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Тот же хук, что и у сердечек в каталоге: список избранного — общий кеш,
  // поэтому карточка исчезает отсюда сразу после снятия сердечка.
  const doctors = useFavoriteToggle("doctor");
  const clinics = useFavoriteToggle("clinic");
  const services = useFavoriteToggle("service");

  const filteredItems = items.filter((item) => item.type === activeTab);

  if (filteredItems.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-border">
        <p className="text-muted text-lg">Список пуст</p>
      </div>
    );
  }

  const variant = isMobile ? "horizontal" : "vertical";

  const renderCard = (item: SavedItem) => {
    if (item.type === "doctor") {
      const { id, full_name, specialty, photo, rating, experience_years } =
        item.data;
      const clinic = item.data.clinic;
      return (
        <DoctorCard
          key={`doctor-${id}`}
          id={id}
          name={full_name}
          specialty={specialty}
          workplaces={
            clinic
              ? [
                  {
                    clinicId: String(clinic.id),
                    clinicName: clinic.name,
                    schedule: EMPTY_SCHEDULE,
                  },
                ]
              : []
          }
          experience={experience_years ?? 0}
          rating={toRating(rating)}
          image={photo ?? undefined}
          isSaved
          onSave={() => doctors.toggle(id)}
          variant={variant}
          onBook={() => router.push(ROUTES.RECORD_FOR_DOCTOR(id))}
        />
      );
    }

    if (item.type === "clinic") {
      const { id, name, logo, city, rating } = item.data;
      return (
        <ClinicCard
          key={`clinic-${id}`}
          id={String(id)}
          name={name}
          address={city}
          rating={toRating(rating)}
          experience={0}
          image={logo ?? undefined}
          isSaved
          onSave={() => clinics.toggle(id)}
          variant={variant}
        />
      );
    }

    const { id, name, category, price, clinic } = item.data;
    return (
      <ServiceCard
        key={`service-${id}`}
        id={String(id)}
        name={name}
        category={category}
        clinic={clinic?.name}
        clinicId={clinic ? String(clinic.id) : undefined}
        price={parsePrice(price)}
        isSaved
        onSave={() => services.toggle(id)}
        variant={variant}
      />
    );
  };

  if (isMobile) {
    return (
      <div className="flex flex-col gap-4">{filteredItems.map(renderCard)}</div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
      {filteredItems.map(renderCard)}
    </div>
  );
};
