"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ClinicSidebar } from "@/widgets/clinic/layout";

import { useClinicCabinet } from "@/entities/clinic-profile";

import { addClinicService, clinicCabinetKeys } from "@/shared/api";
import { colors } from "@/shared/config";
import { Dropdown } from "@/shared/ui";

export default function NewProcedurePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useClinicCabinet();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<string>();
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState(false);
  const [specialty, setSpecialty] = useState("");
  const [price, setPrice] = useState("0");
  const [duration, setDuration] = useState("");
  const [clinic, setClinic] = useState("");
  const [address, setAddress] = useState("");

  const [schedule, setSchedule] = useState([
    { day: "ПН", from: "00:00", to: "00:00" },
    { day: "ВТ", from: "00:00", to: "00:00" },
    { day: "СР", from: "00:00", to: "00:00" },
    { day: "ЧТ", from: "00:00", to: "00:00" },
    { day: "ПТ", from: "00:00", to: "00:00" },
    { day: "СБ", from: "00:00", to: "00:00" },
    { day: "ВС", from: "00:00", to: "00:00" },
  ]);

  const [lunchBreak, setLunchBreak] = useState({ from: "00:00", to: "00:00" });

  const addMutation = useMutation({
    mutationFn: addClinicService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicCabinetKeys.services() });
      toast.success("Процедура добавлена");
      router.push("/clinic-profile/procedures");
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: Record<string, string[]> } })
        ?.response?.data;
      const msg = data
        ? Object.values(data).flat()[0]
        : "Не удалось сохранить процедуру. Попробуйте снова";
      toast.error(msg);
    },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    addMutation.mutate({
      name: name.trim(),
      category: specialty,
      price: price.trim() || undefined,
      duration: duration ? Number(duration) : undefined,
      is_active: true,
    });
  };

  const updateSchedule = (
    index: number,
    field: "from" | "to",
    value: string,
  ) => {
    setSchedule((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  return (
    <div className="w-full max-w-360 mx-auto px-4 md:px-10 py-8">
      <h1 className="text-[40px] font-semibold text-foreground mb-8">
        Мой профиль
      </h1>

      <div className="flex gap-6">
        <ClinicSidebar
          clinicName={profile?.name ?? ""}
          clinicLogo={profile?.logo}
          rating={profile?.rating}
        />

        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
              aria-label="Назад"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke={colors.foreground}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <h2 className="text-[32px] font-semibold text-foreground flex-1">
              Добавить процедуру
            </h2>

            <button
              onClick={handleSave}
              disabled={addMutation.isPending}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
                addMutation.isPending
                  ? "bg-dim text-white cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              {addMutation.isPending ? "Сохранение..." : "Сохранить"}
            </button>
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl p-8 border border-border space-y-8">
            {/* Личные данные */}
            <div>
              <h3 className="text-foreground font-semibold text-lg mb-4">
                Личные данные
              </h3>

              {/* Фото процедуры */}
              <div className="mb-4">
                <label className="block text-foreground text-sm font-medium mb-2">
                  Фото процедуры
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-primary-tint border border-border flex items-center justify-center shrink-0">
                    {photo ? (
                      <Image
                        src={photo}
                        alt="Фото"
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                      >
                        <circle cx="24" cy="24" r="24" fill={colors.border} />
                      </svg>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-full border border-border text-secondary text-sm hover:bg-surface transition-colors flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 3.33334V12.6667M3.33333 8H12.6667"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    Добавить фото
                  </button>
                </div>
                <p className="text-xs text-muted mt-2">
                  Загрузка фото процедуры — в разработке
                </p>
              </div>

              <div className="space-y-4">
                {/* Название процедуры */}
                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Название процедуры <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (e.target.value.trim()) setNameError(false);
                    }}
                    placeholder="Введите название"
                    className={`w-full px-4 py-3 rounded-2xl border text-foreground placeholder:text-dim focus:outline-none focus:border-primary transition-colors ${
                      nameError ? "border-primary" : "border-border"
                    }`}
                  />
                  {nameError && (
                    <p className="text-primary text-xs mt-1">
                      Обязательное поле
                    </p>
                  )}
                </div>

                {/* Специализация (используется как категория услуги) */}
                <Dropdown
                  label="Специализация"
                  placeholder="Выберите из списка"
                  options={[
                    { label: "Кардиология", value: "Кардиология" },
                    { label: "Терапия", value: "Терапия" },
                    { label: "Хирургия", value: "Хирургия" },
                    { label: "Косметология", value: "Косметология" },
                  ]}
                  value={specialty}
                  onChange={(val) => setSpecialty(val)}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Стоимость */}
                  <div>
                    <label className="block text-foreground text-sm font-medium mb-2">
                      Стоимость, сом
                    </label>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-2xl border border-border text-foreground placeholder:text-dim focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Длительность */}
                  <div>
                    <label className="block text-foreground text-sm font-medium mb-2">
                      Длительность, мин
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-2xl border border-border text-foreground placeholder:text-dim focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Клиника */}
                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Клиника, проводящая процедуру
                  </label>
                  <input
                    type="text"
                    value={clinic}
                    onChange={(e) => setClinic(e.target.value)}
                    placeholder="Введите название клиники"
                    className="w-full px-4 py-3 rounded-2xl border border-border text-foreground placeholder:text-dim focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Адрес */}
                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Адрес клиники, проводящей процедуру
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Введите адрес клиники"
                    className="w-full px-4 py-3 rounded-2xl border border-border text-foreground placeholder:text-dim focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <p className="text-xs text-muted">
                  Привязка процедуры к конкретной клинике/адресу — в разработке.
                  Пока процедура сохраняется в общий список услуг вашей клиники.
                </p>
              </div>
            </div>

            {/* График проведения процедуры */}
            <div>
              <h3 className="text-foreground font-semibold text-lg mb-2">
                График проведения процедуры
              </h3>
              <p className="text-muted text-sm mb-4 leading-relaxed">
                Укажите время проведения процедуры (с какого времени до какого),
                оставьте поля пустыми, если в какой-то день процедура не
                проводится.
              </p>
              <p className="text-xs text-muted mb-4">
                Расписание процедуры — в разработке, пока не сохраняется.
              </p>

              <div className="space-y-3">
                {schedule.map((item, index) => (
                  <div key={item.day} className="flex items-center gap-4">
                    <span className="text-foreground text-sm font-medium w-8">
                      {item.day}
                    </span>
                    <input
                      type="time"
                      value={item.from}
                      onChange={(e) =>
                        updateSchedule(index, "from", e.target.value)
                      }
                      className="w-28 px-3 py-2 rounded-xl border border-border text-dim text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                    <span className="text-muted">—</span>
                    <input
                      type="time"
                      value={item.to}
                      onChange={(e) =>
                        updateSchedule(index, "to", e.target.value)
                      }
                      className="w-28 px-3 py-2 rounded-xl border border-border text-dim text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                ))}

                {/* Обеденный перерыв */}
                <div className="flex items-center gap-4 pt-1">
                  <span className="text-foreground text-sm font-medium whitespace-nowrap">
                    Обеденный перерыв
                  </span>
                  <input
                    type="time"
                    value={lunchBreak.from}
                    onChange={(e) =>
                      setLunchBreak({ ...lunchBreak, from: e.target.value })
                    }
                    className="w-28 px-3 py-2 rounded-xl border border-border text-dim text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <span className="text-muted">—</span>
                  <input
                    type="time"
                    value={lunchBreak.to}
                    onChange={(e) =>
                      setLunchBreak({ ...lunchBreak, to: e.target.value })
                    }
                    className="w-28 px-3 py-2 rounded-xl border border-border text-dim text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
