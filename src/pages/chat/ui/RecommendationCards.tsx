"use client";

import { FC } from "react";

import { useRouter } from "next/navigation";

import { ClinicCompactCard } from "@/entities/clinic";
import { DoctorCompactCard } from "@/entities/doctor";
import { ServiceCompactCard } from "@/entities/service";

import type { AiRecommendations } from "@/shared/api";
import { ROUTES } from "@/shared/config";

const GroupLabel: FC<{ label: string }> = ({ label }) => (
  <p className="text-xs font-medium text-secondary uppercase mb-2">{label}</p>
);

// Карточки-рекомендации под ответом ИИ-ассистента. Рендерятся отдельным
// блоком, а не внутри текстового пузыря MessageBubble — иначе они были бы
// зажаты в его 65–75% ширины колонки.
export const RecommendationCards: FC<{
  recommendations?: AiRecommendations | null;
}> = ({ recommendations }) => {
  const router = useRouter();
  // Ответы бэка нигде рантаймом не валидируются, а тип обещает три
  // обязательных массива. Если придёт частичный объект (или пустой список
  // вместо объекта — обычная форма для пустой связи у DRF), голая
  // деструктуризация дала бы undefined.length и уронила бы ВСЮ страницу чата
  // в error boundary. Дефолты держат этот удар.
  const { doctors = [], clinics = [], services = [] } = recommendations ?? {};

  if (doctors.length === 0 && clinics.length === 0 && services.length === 0) {
    return null;
  }

  return (
    <div className="self-start w-full md:max-w-[85%] flex flex-col gap-3">
      {doctors.length > 0 && (
        <div>
          <GroupLabel label="Врачи" />
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {doctors.map((doctor) => (
              <DoctorCompactCard
                key={doctor.id}
                id={doctor.id}
                name={doctor.full_name}
                specialty={doctor.specialty}
                photo={doctor.photo}
                rating={doctor.rating}
                onBook={() => router.push(ROUTES.RECORD_FOR_DOCTOR(doctor.id))}
              />
            ))}
          </div>
        </div>
      )}

      {clinics.length > 0 && (
        <div>
          <GroupLabel label="Клиники" />
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {clinics.map((clinic) => (
              <ClinicCompactCard
                key={clinic.id}
                id={clinic.id}
                name={clinic.name}
                logo={clinic.logo}
                city={clinic.city}
                rating={clinic.rating}
                onBook={() =>
                  router.push(`${ROUTES.RECORD}?clinic=${clinic.id}`)
                }
              />
            ))}
          </div>
        </div>
      )}

      {services.length > 0 && (
        <div>
          <GroupLabel label="Услуги" />
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {services.map((service) => {
              const params = new URLSearchParams({
                service: String(service.id),
              });
              if (service.clinic) {
                params.set("clinic", String(service.clinic.id));
              }
              const href = `${ROUTES.RECORD}?${params.toString()}`;

              return (
                <ServiceCompactCard
                  key={service.id}
                  name={service.name}
                  category={service.category}
                  price={service.price}
                  clinicName={service.clinic?.name}
                  href={href}
                  onBook={() => router.push(href)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
