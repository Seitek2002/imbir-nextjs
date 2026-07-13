"use client";

import { FC, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  api,
  createAppointment,
  getDoctorAvailableSlots,
  getProfile,
} from "@/shared/api";
import { ArrowLeftIcon, ArrowRightIcon } from "@/shared/assets/icons";
import {
  groupAvailableSlots,
  isEmailValid,
  isPhoneValid,
  normalizeLocalPhone,
  toApiDate,
  toApiTime,
} from "@/shared/lib/booking";
import { extractErrorMessage } from "@/shared/lib/errors";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/shared/store";
import { Button, Input, Textarea } from "@/shared/ui";
import { Modal } from "@/shared/ui/modal";

type Workplace = {
  clinicId: string;
  clinicName: string;
  clinicAddress?: string;
  price: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  doctor: {
    id: string | number;
    name: string;
    specialty: string;
    image?: any;
    workplaces: Workplace[];
  };
};

const WEEK_DAYS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const toMondayIndex = (day: number) => (day + 6) % 7;
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const pad = (n: number) => String(n).padStart(2, "0");

export const OfflineBookingModal: FC<Props> = ({ isOpen, onClose, doctor }) => {
  const [step, setStep] = useState(1);

  // Step 1 State
  const [selectedClinicId, setSelectedClinicId] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  // Step 2 State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Step 3 State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auth Profile Autofill & Modal Reset
  const user = useAuthStore((s) => s.user);
  const canUseOnline = Boolean(user);

  const { data: profile } = useQuery({
    queryKey: ["record-profile-modal"],
    queryFn: () => getProfile(),
    enabled: isOpen && canUseOnline,
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedClinicId(doctor.workplaces[0]?.clinicId || "");
      setSelectedServiceId("");
      setSelectedDate(null);
      setSelectedTime(null);
      setComment("");
      setErrors({});

      if (profile) {
        setFirstName(profile.first_name || "");
        setLastName(profile.last_name || "");
        if (profile.phone) {
          let localPhone = profile.phone;
          if (localPhone.startsWith("+996")) {
            localPhone = localPhone.slice(4);
          } else if (localPhone.startsWith("996")) {
            localPhone = localPhone.slice(3);
          } else if (localPhone.startsWith("+")) {
            localPhone = localPhone.slice(1);
          }
          const cleaned = localPhone.replace(/\D/g, "");
          setPhone(normalizeLocalPhone(cleaned));
        } else {
          setPhone("");
        }
        setEmail(profile.email || "");
      } else {
        setFirstName("");
        setLastName("");
        setPhone("");
        setEmail("");
      }
    }
  }, [isOpen, profile, doctor]);

  // Fetch services for this doctor
  const { data: servicesRaw } = useQuery({
    queryKey: ["doctor-services-modal", doctor.id],
    queryFn: () => api.getServices({ doctor_id: String(doctor.id) }),
    enabled: isOpen,
  });

  const services = useMemo(() => {
    return servicesRaw || [];
  }, [servicesRaw]);

  // Date picker helpers
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  useEffect(() => {
    const d = selectedDate ?? new Date();
    setMonthCursor(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [selectedDate]);

  const monthLabel = `${MONTHS[monthCursor.getMonth()]} ${monthCursor.getFullYear()}`;

  const isDateDisabled = (date: Date) => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    return date < startOfToday;
  };

  // Calendar cells for desktop grid
  const monthCells = useMemo(() => {
    const firstDay = new Date(
      monthCursor.getFullYear(),
      monthCursor.getMonth(),
      1,
    );
    const daysInMonth = new Date(
      monthCursor.getFullYear(),
      monthCursor.getMonth() + 1,
      0,
    ).getDate();
    const leading = toMondayIndex(firstDay.getDay());

    const cells: Array<{ date: Date | null; disabled: boolean; key: string }> =
      [];

    for (let i = 0; i < leading; i++) {
      cells.push({ date: null, disabled: true, key: `empty-${i}` });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        monthCursor.getFullYear(),
        monthCursor.getMonth(),
        day,
      );
      cells.push({
        date,
        disabled: isDateDisabled(date),
        key: `d-${day}`,
      });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ date: null, disabled: true, key: `tail-${cells.length}` });
    }
    return cells;
  }, [monthCursor]);

  // Mobile horizontal day strip
  const mobileStrip = useMemo(() => {
    const firstDay = new Date(
      monthCursor.getFullYear(),
      monthCursor.getMonth(),
      1,
    );
    const lastDay = new Date(
      monthCursor.getFullYear(),
      monthCursor.getMonth() + 1,
      0,
    );
    const start = addDays(firstDay, -7);
    const total =
      Math.round((lastDay.getTime() - start.getTime()) / 86400000) + 1 + 7;
    return Array.from({ length: total }, (_, i) => {
      const date = addDays(start, i);
      return { date, disabled: isDateDisabled(date) };
    });
  }, [monthCursor]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    if (
      date.getMonth() !== monthCursor.getMonth() ||
      date.getFullYear() !== monthCursor.getFullYear()
    ) {
      setMonthCursor(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  // Fetch slots
  const selectedDateStr = selectedDate ? toApiDate(selectedDate) : null;
  const { data: slotsData, isLoading: isLoadingSlots } = useQuery({
    queryKey: [
      "doctor-available-slots-modal",
      doctor.id,
      selectedDateStr,
      isOpen,
    ],
    queryFn: () =>
      getDoctorAvailableSlots(doctor.id as string, selectedDateStr as string),
    enabled: Boolean(doctor.id) && Boolean(selectedDateStr) && isOpen,
  });

  const timeGroups = useMemo(
    () => groupAvailableSlots(slotsData?.slots ?? []),
    [slotsData],
  );

  const selectedClinic = useMemo(() => {
    return (
      doctor.workplaces.find((w) => w.clinicId === selectedClinicId) || null
    );
  }, [doctor.workplaces, selectedClinicId]);

  const selectedService = useMemo(() => {
    return services.find((s) => String(s.id) === selectedServiceId) || null;
  }, [services, selectedServiceId]);

  // Create Appointment Mutation
  const createAppointmentMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      setStep(4);
    },
    onError: (err: any) => {
      toast.error(
        extractErrorMessage(
          err?.response?.data,
          "Не удалось создать запись. Попробуйте еще раз.",
        ),
      );
    },
  });

  const handleBook = () => {
    const nextErrors: Record<string, string> = {};

    if (!canUseOnline) {
      if (!firstName.trim()) nextErrors.firstName = "Введите ваше имя";
      if (!lastName.trim()) nextErrors.lastName = "Введите вашу фамилию";

      if (!phone.trim()) {
        nextErrors.phone = "Введите номер телефона";
      } else if (!isPhoneValid(phone)) {
        nextErrors.phone = "Проверьте формат телефона";
      }
    }

    if (email && !isEmailValid(email)) {
      nextErrors.email = "Введите корректный email";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (!selectedDate || !selectedTime) {
      toast.error("Выберите дату и время приема");
      return;
    }

    const requestBody: any = {
      date: toApiDate(selectedDate),
      time: toApiTime(selectedTime),
      is_online: false,
      doctor_id: Number(doctor.id),
      clinic_id: Number(selectedClinicId),
      service_id: Number(selectedServiceId),
    };

    if (comment.trim()) requestBody.notes = comment.trim();

    if (!canUseOnline) {
      requestBody.guest_name = `${firstName.trim()} ${lastName.trim()}`.trim();
      requestBody.guest_phone = `+996 ${phone.trim()}`;
      if (email.trim()) requestBody.guest_email = email.trim();
    }

    createAppointmentMutation.mutate(requestBody);
  };

  const selectedDateLabel = selectedDate
    ? `${pad(selectedDate.getDate())} ${MONTHS[selectedDate.getMonth()].slice(0, 3)}`
    : "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 4 ? "Запись создана!" : "Офлайн-запись"}
    >
      <div className="flex flex-col gap-4 text-left">
        {step < 4 && (
          <div className="flex items-center gap-3 p-3 bg-surface rounded-2xl border border-border-soft">
            {doctor.image && (
              <img
                src={
                  typeof doctor.image === "string"
                    ? doctor.image
                    : doctor.image?.src || ""
                }
                alt={doctor.name}
                className="w-12 h-12 rounded-full object-cover shrink-0"
              />
            )}
            <div>
              <h4 className="font-semibold text-foreground text-sm">
                {doctor.name}
              </h4>
              <p className="text-xs text-muted">{doctor.specialty}</p>
            </div>
          </div>
        )}

        {/* STEP 1: Clinic & Service Selection */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Clinic Dropdown */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-overlay">
                Клиника
              </label>
              <select
                value={selectedClinicId}
                onChange={(e) => setSelectedClinicId(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-border-soft text-sm text-foreground outline-none bg-white focus:border-primary/60 transition-colors"
              >
                {doctor.workplaces.map((w) => (
                  <option key={w.clinicId} value={w.clinicId}>
                    {w.clinicName} (от {w.price} с)
                  </option>
                ))}
              </select>
            </div>

            {/* Service Dropdown */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-overlay">Услуга</label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-border-soft text-sm text-foreground outline-none bg-white focus:border-primary/60 transition-colors"
              >
                <option value="">Выберите услугу</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.price} с
                  </option>
                ))}
              </select>
            </div>

            <Button
              className="w-full justify-center mt-2"
              disabled={!selectedClinicId || !selectedServiceId}
              onClick={() => setStep(2)}
            >
              Продолжить
            </Button>
          </div>
        )}

        {/* STEP 2: Date & Time Picker */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="border border-border-soft rounded-2xl p-3">
              {/* Month Navigation */}
              <div className="flex items-center justify-between bg-background rounded-xl px-2 py-1.5 mb-3">
                <button
                  type="button"
                  onClick={() =>
                    setMonthCursor(
                      (p) => new Date(p.getFullYear(), p.getMonth() - 1, 1),
                    )
                  }
                  className="p-1 hover:bg-white rounded-full transition-colors"
                >
                  <ArrowLeftIcon className="size-4 text-muted" />
                </button>
                <span className="text-sm font-medium text-foreground">
                  {monthLabel}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setMonthCursor(
                      (p) => new Date(p.getFullYear(), p.getMonth() + 1, 1),
                    )
                  }
                  className="p-1 hover:bg-white rounded-full transition-colors"
                >
                  <ArrowRightIcon className="size-4 text-muted" />
                </button>
              </div>

              {/* Calendar cells for desktop/tablet inside modal */}
              <div className="hidden sm:block">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {WEEK_DAYS.map((d) => (
                    <span
                      key={d}
                      className="text-center text-xs text-muted py-1"
                    >
                      {d}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {monthCells.map((cell) => {
                    if (!cell.date)
                      return <div key={cell.key} className="h-9" />;
                    const isSelected = selectedDate
                      ? isSameDay(selectedDate, cell.date)
                      : false;
                    const date = cell.date;
                    return (
                      <button
                        key={cell.key}
                        type="button"
                        onClick={() => !cell.disabled && handleDateSelect(date)}
                        disabled={cell.disabled}
                        className={cn(
                          "h-8 rounded-lg border text-xs transition-all",
                          isSelected
                            ? "border-primary text-primary bg-[#FFF3EE]"
                            : "border-border-soft text-foreground hover:border-primary/40",
                          cell.disabled &&
                            "bg-background text-[#A9AFB2] border-[#ECEDEE] cursor-not-allowed",
                        )}
                      >
                        {pad(date.getDate())}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Horizontal Strip for Mobile viewport inside modal */}
              <div className="sm:hidden overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex gap-1.5" style={{ width: "max-content" }}>
                  {mobileStrip.map((item, idx) => {
                    const isSelected = selectedDate
                      ? isSameDay(selectedDate, item.date)
                      : false;
                    const dayLabel =
                      WEEK_DAYS[toMondayIndex(item.date.getDay())];
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          !item.disabled && handleDateSelect(item.date)
                        }
                        disabled={item.disabled}
                        className={cn(
                          "flex flex-col items-center justify-center gap-1 w-11 h-12 rounded-xl border text-xs transition-all shrink-0",
                          isSelected
                            ? "border-primary text-primary bg-[#FFF3EE]"
                            : "border-border-soft text-foreground bg-white",
                          item.disabled &&
                            "bg-background text-[#A9AFB2] border-[#ECEDEE] cursor-not-allowed",
                        )}
                      >
                        <span className="text-[9px] opacity-75">
                          {dayLabel}
                        </span>
                        <span className="font-semibold">
                          {pad(item.date.getDate())}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Time slots */}
            <div className="border border-border-soft rounded-2xl p-3 space-y-3 max-h-48 overflow-y-auto">
              {isLoadingSlots ? (
                <p className="text-xs text-muted text-center py-2">
                  Загрузка свободного времени...
                </p>
              ) : !selectedDate ? (
                <p className="text-xs text-muted text-center py-2">
                  Выберите дату, чтобы увидеть свободное время
                </p>
              ) : timeGroups.length === 0 ? (
                <p className="text-xs text-muted text-center py-2">
                  Нет свободного времени на выбранную дату
                </p>
              ) : (
                timeGroups.map((group) => (
                  <div key={group.label} className="space-y-1">
                    <p className="text-xs text-secondary">{group.label}</p>
                    <div className="flex flex-wrap gap-1">
                      {group.slots.map((slot) => {
                        const isSelected = selectedTime === slot.value;
                        return (
                          <button
                            key={slot.value}
                            type="button"
                            onClick={() =>
                              !slot.disabled && setSelectedTime(slot.value)
                            }
                            disabled={slot.disabled}
                            className={cn(
                              "min-w-12 px-1.5 h-8 rounded-lg border text-xs transition-colors",
                              isSelected
                                ? "border-primary text-primary bg-[#FFF3EE]"
                                : "border-border-soft text-foreground hover:border-primary/40",
                              slot.disabled &&
                                "bg-background text-[#A9AFB2] border-[#ECEDEE] cursor-not-allowed",
                            )}
                          >
                            {slot.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 justify-center"
                onClick={() => setStep(1)}
              >
                Назад
              </Button>
              <Button
                className="flex-1 justify-center"
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(3)}
              >
                Продолжить
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Patient Form */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Имя"
                placeholder="Введите ваше имя"
                value={firstName}
                disabled={canUseOnline}
                onChange={(event) => {
                  setFirstName(event.target.value);
                  setErrors((prev) => ({ ...prev, firstName: "" }));
                }}
                error={errors.firstName}
              />

              <Input
                label="Введите фамилию"
                placeholder="Введите вашу фамилию"
                value={lastName}
                disabled={canUseOnline}
                onChange={(event) => {
                  setLastName(event.target.value);
                  setErrors((prev) => ({ ...prev, lastName: "" }));
                }}
                error={errors.lastName}
              />

              <div className="space-y-1">
                <span className="text-xs font-medium text-overlay">
                  Номер телефона
                </span>
                <div
                  className={cn(
                    "flex items-center h-10 rounded-lg border transition-all overflow-hidden bg-white",
                    errors.phone ? "border-red-400" : "border-border-soft",
                  )}
                >
                  <span className="px-2.5 h-full flex items-center bg-[#F7F8F9] border-r border-border-soft text-xs text-foreground select-none shrink-0">
                    +996
                  </span>
                  <input
                    type="tel"
                    placeholder="000 000 000"
                    value={phone}
                    disabled={canUseOnline}
                    onChange={(event) => {
                      setPhone(normalizeLocalPhone(event.target.value));
                      setErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    className="flex-1 h-full px-2.5 text-xs text-foreground outline-none bg-transparent placeholder:text-muted"
                  />
                </div>
                {errors.phone && (
                  <p className="text-[10px] text-red-500">{errors.phone}</p>
                )}
              </div>

              <Input
                label="Электронная почта"
                placeholder="Введите вашу почту"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrors((prev) => ({ ...prev, email: "" }));
                }}
                error={errors.email}
              />

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-overlay mb-1 block">
                  Комментарий (необязательно)
                </label>
                <Textarea
                  rows={3}
                  placeholder="Введите ваш комментарий"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                className="flex-1 justify-center"
                onClick={() => setStep(2)}
              >
                Назад
              </Button>
              <Button
                className="flex-1 justify-center"
                disabled={createAppointmentMutation.isPending}
                onClick={handleBook}
              >
                {createAppointmentMutation.isPending
                  ? "Отправка..."
                  : "Записаться"}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Success Screen */}
        {step === 4 && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
              ✓
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">
                Вы успешно записаны!
              </h3>
              <p className="text-xs text-muted">
                Детали вашего приема сохранены в профиле.
              </p>
            </div>

            <div className="bg-surface rounded-2xl p-4 border border-border-soft text-sm space-y-2.5">
              <div className="flex justify-between border-b border-border-soft pb-2">
                <span className="text-secondary">Врач:</span>
                <span className="font-semibold text-foreground">
                  {doctor.name}
                </span>
              </div>
              {selectedClinic && (
                <div className="flex justify-between border-b border-border-soft pb-2 text-right">
                  <span className="text-secondary shrink-0 mr-4">Клиника:</span>
                  <span className="font-semibold text-foreground">
                    {selectedClinic.clinicName}
                    {selectedClinic.clinicAddress && (
                      <span className="block text-xs font-normal text-muted mt-0.5">
                        {selectedClinic.clinicAddress}
                      </span>
                    )}
                  </span>
                </div>
              )}
              {selectedService && (
                <div className="flex justify-between border-b border-border-soft pb-2 text-right">
                  <span className="text-secondary shrink-0 mr-4">Услуга:</span>
                  <span className="font-semibold text-foreground">
                    {selectedService.name}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-1">
                <span className="text-secondary">Дата и время:</span>
                <span className="font-semibold text-primary">
                  {selectedDateLabel}, в {selectedTime}
                </span>
              </div>
            </div>

            <Button className="w-full justify-center" onClick={onClose}>
              Готово
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
