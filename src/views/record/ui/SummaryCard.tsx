"use client";

import { FC, useState } from "react";

import Image from "next/image";

import { type ConsultationMode } from "@/features/appointment-datetime-picker";

import { CalendarIcon } from "@/shared/assets/icons";
import { Button } from "@/shared/ui";

import { formatDateLabel, formatPrice } from "../model/lib";
import type { Doctor, Service } from "../model/types";

export const SummaryCard: FC<{
  doctor: Doctor;
  service: Service;
  mode: ConsultationMode;
  selectedDate: Date | null;
  selectedTime: string | null;
}> = ({ doctor, service, mode, selectedDate, selectedTime }) => {
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckStatus = () => {
    setIsChecking(true);
    setTimeout(() => setIsChecking(false), 3000);
  };

  return (
    <aside className="relative border border-border-soft rounded-3xl bg-white overflow-hidden lg:sticky lg:top-6 flex flex-col lg:w-100 lg:h-128.75">
      {isChecking && (
        <div className="absolute inset-0 z-10 bg-white/70 rounded-3xl flex items-center justify-center">
          <svg
            className="animate-spin size-10 text-primary"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>
      )}

      <div className="relative h-64 lg:flex-1 bg-primary-tint">
        {doctor.image ? (
          <Image
            src={doctor.image}
            alt={doctor.name}
            fill
            className="object-cover object-[center_20%]"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : null}
      </div>

      <div className="p-3 shrink-0">
        <p className="text-base font-semibold text-foreground text-center leading-snug mt-2">
          {doctor.name}
        </p>
        <p className="text-sm text-secondary text-center mt-0.5">
          {doctor.specialty}
        </p>

        <div className="mt-3 border border-border-soft rounded-2xl p-3">
          <p className="text-sm font-medium text-foreground">{service.title}</p>
          <p className="text-sm text-secondary mt-0.5">
            {mode === "online" ? "Онлайн-консультация" : "Оффлайн-консультация"}
          </p>
          <div className="flex items-center gap-1.5 text-sm text-secondary mt-1">
            <CalendarIcon className="size-4 shrink-0" />
            <span>
              {selectedDate && selectedTime
                ? `${formatDateLabel(selectedDate)} • ${selectedTime}`
                : "Дата и время не выбраны"}
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm text-secondary">
            <span>К оплате</span>
            <span className="text-foreground font-semibold">
              {formatPrice(service.price)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-secondary">
            <span>Статус</span>
            <span className="px-2.5 py-1 rounded-full bg-[#FFF3EE] text-primary text-xs font-medium">
              Ожидает оплаты
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full justify-center mt-3 text-foreground"
          disabled={isChecking}
          onClick={handleCheckStatus}
        >
          Проверить статус
        </Button>
      </div>
    </aside>
  );
};
