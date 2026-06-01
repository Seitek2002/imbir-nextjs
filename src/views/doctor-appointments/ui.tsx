"use client";

import { FC, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { DoctorPageLayout } from "@/widgets/doctor-page-layout";

import { getDoctorAppointments } from "@/shared/api/doctor-cabinet/requests";
import { doctorCabinetKeys } from "@/shared/api/queryKeys";

type Tab = "all" | "upcoming" | "completed" | "cancelled";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "upcoming", label: "Предстоящие" },
  { key: "completed", label: "Завершённые" },
  { key: "cancelled", label: "Отменённые" },
];

const STATUS_LABEL: Record<Tab, string> = {
  all: "",
  upcoming: "Предстоит",
  completed: "Завершён",
  cancelled: "Отменён",
};

export const DoctorAppointmentsPage: FC = () => {
  const [tab, setTab] = useState<Tab>("all");

  const { data, isLoading } = useQuery({
    queryKey: doctorCabinetKeys.appointments({ status: tab }),
    queryFn: () => getDoctorAppointments(tab === "all" ? {} : { status: tab }),
  });

  const appointments = data?.data ?? [];

  return (
    <DoctorPageLayout title="Записи">
      <h2 className="text-[28px] font-semibold text-[#191A1B] mb-6 hidden lg:block">
        Записи
      </h2>

      <div className="flex gap-1 bg-white rounded-2xl p-1 mb-4 border border-[#E5E6E8]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-[#F5653E] text-white"
                : "text-[#838A8D] hover:text-[#191A1B]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-[#E5E6E8] overflow-hidden">
        <div className="grid grid-cols-3 px-5 py-3 border-b border-[#E5E6E8]">
          <span className="text-[#838A8D] text-sm font-medium">Пациент</span>
          <span className="text-[#838A8D] text-sm font-medium">
            Дата / Время
          </span>
          <span className="text-[#838A8D] text-sm font-medium">Статус</span>
        </div>

        {isLoading ? (
          <div className="px-5 py-12 text-center text-[#838A8D] text-sm">
            Загрузка...
          </div>
        ) : appointments.length === 0 ? (
          <div className="px-5 py-12 text-center text-[#838A8D] text-sm">
            Нет записей
          </div>
        ) : (
          appointments.map((a, i) => (
            <div
              key={a.id}
              className={`grid grid-cols-3 px-5 py-4 ${
                i !== appointments.length - 1 ? "border-b border-[#E5E6E8]" : ""
              }`}
            >
              <span className="text-[#191A1B] text-sm font-medium">
                {a.patient.full_name}
              </span>
              <span className="text-[#838A8D] text-sm">
                {a.date} {a.time}
              </span>
              <span
                className={`text-sm font-medium ${
                  a.status === "upcoming"
                    ? "text-[#F5653E]"
                    : a.status === "completed"
                      ? "text-green-600"
                      : "text-[#838A8D]"
                }`}
              >
                {STATUS_LABEL[a.status as Tab] ?? a.status}
              </span>
            </div>
          ))
        )}
      </div>
    </DoctorPageLayout>
  );
};
