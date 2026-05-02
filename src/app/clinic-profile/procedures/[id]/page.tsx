"use client";

import { useRef, useState } from "react";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { ClinicSidebar } from "@/widgets/clinic-sidebar";

import { MOCK_CLINIC_PROFILE } from "@/entities/clinic-profile";

type Specialist = {
  id: string;
  name: string;
};

type TimeSlot = {
  time: string;
  selected: boolean;
};

const MOCK_PROCEDURE_DATA = {
  name: "Чистка лица",
  photo: "/procedure-photo.jpg",
  price: "1 700",
  address: "г. Бишкек, ул. Тыныстанова, 189",
  schedule: "ПН-ПТ, 10:00-17:00",
  specialists: [
    { id: "1", name: "Мамбетова Назгуль Бакытовна" },
    { id: "2", name: "Мухамедова Мухаббат Раскуловна" },
    { id: "3", name: "Нурбаев Данияр Кадырбаевич" },
    { id: "4", name: "Сүюмбаева Арсен Акимович" },
    { id: "5", name: "Токтогулова Жарыныай Мамакуловна" },
    { id: "6", name: "Чолпонкулова Мейрамкан Бекешовна" },
  ],
};

export default function ProcedureDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(MOCK_PROCEDURE_DATA.name);
  const [photo, setPhoto] = useState<string | undefined>(
    MOCK_PROCEDURE_DATA.photo,
  );
  const [price, setPrice] = useState(MOCK_PROCEDURE_DATA.price);
  const [address, setAddress] = useState(MOCK_PROCEDURE_DATA.address);
  const [schedule, setSchedule] = useState(MOCK_PROCEDURE_DATA.schedule);
  const [specialists, setSpecialists] = useState<Specialist[]>(
    MOCK_PROCEDURE_DATA.specialists,
  );
  const [scheduleType, setScheduleType] = useState<"online" | "offline">(
    "online",
  );
  const [currentMonth, setCurrentMonth] = useState("Декабрь 2026");
  const [selectedDays, setSelectedDays] = useState<number[]>([16, 19]);

  const [morningSlots, setMorningSlots] = useState<TimeSlot[]>([
    { time: "08:00", selected: false },
    { time: "09:00", selected: false },
    { time: "10:00", selected: false },
    { time: "11:00", selected: false },
    { time: "12:00", selected: false },
  ]);

  const [afternoonSlots, setAfternoonSlots] = useState<TimeSlot[]>([
    { time: "01:00", selected: false },
    { time: "02:00", selected: false },
    { time: "03:00", selected: true },
    { time: "04:00", selected: false },
    { time: "05:00", selected: false },
  ]);

  const [eveningSlots, setEveningSlots] = useState<TimeSlot[]>([
    { time: "06:00", selected: false },
    { time: "07:00", selected: false },
    { time: "08:00", selected: false },
    { time: "09:00", selected: false },
  ]);

  const daysInMonth = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 21,
  ];

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
    console.log("Save procedure data");
    router.push("/clinic-profile/procedures");
  };

  const handleDelete = () => {
    if (confirm("Вы уверены, что хотите удалить процедуру?")) {
      console.log("Delete procedure", id);
      router.push("/clinic-profile/procedures");
    }
  };

  const removeSpecialist = (id: string) => {
    setSpecialists((prev) => prev.filter((spec) => spec.id !== id));
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const toggleTimeSlot = (
    type: "morning" | "afternoon" | "evening",
    index: number,
  ) => {
    if (type === "morning") {
      setMorningSlots((prev) =>
        prev.map((slot, i) =>
          i === index ? { ...slot, selected: !slot.selected } : slot,
        ),
      );
    } else if (type === "afternoon") {
      setAfternoonSlots((prev) =>
        prev.map((slot, i) =>
          i === index ? { ...slot, selected: !slot.selected } : slot,
        ),
      );
    } else {
      setEveningSlots((prev) =>
        prev.map((slot, i) =>
          i === index ? { ...slot, selected: !slot.selected } : slot,
        ),
      );
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-10 py-8">
      <h1 className="text-[40px] font-semibold text-[#191A1B] mb-8">
        Мой профиль
      </h1>

      <div className="flex gap-6">
        <ClinicSidebar
          clinicName={MOCK_CLINIC_PROFILE.name}
          clinicLogo={MOCK_CLINIC_PROFILE.logo}
          rating={MOCK_CLINIC_PROFILE.rating}
        />

        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F8F9FA] transition-colors"
              aria-label="Назад"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="#191A1B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <h2 className="text-[32px] font-semibold text-[#191A1B] flex-1">
              Назад
            </h2>

            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-full border border-[#E5E6E8] text-[#686F72] font-medium hover:bg-[#F8F9FA] transition-colors flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M11.3334 2.00001C11.5086 1.82491 11.7164 1.68605 11.9452 1.59129C12.174 1.49653 12.4193 1.44775 12.6667 1.44775C12.9142 1.44775 13.1595 1.49653 13.3883 1.59129C13.6171 1.68605 13.8249 1.82491 14.0001 2.00001C14.1752 2.17511 14.314 2.38293 14.4088 2.61173C14.5036 2.84053 14.5523 3.08584 14.5523 3.33334C14.5523 3.58084 14.5036 3.82615 14.4088 4.05495C14.314 4.28375 14.1752 4.49157 14.0001 4.66668L5.00008 13.6667L1.33341 14.6667L2.33341 11L11.3334 2.00001Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Редактировать
            </button>

            <button
              onClick={handleDelete}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#FFF8F5] transition-colors"
              aria-label="Удалить"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M2.5 5H4.16667M4.16667 5H17.5M4.16667 5V16.6667C4.16667 17.1087 4.34226 17.5326 4.65482 17.8452C4.96738 18.1577 5.39131 18.3333 5.83333 18.3333H14.1667C14.6087 18.3333 15.0326 18.1577 15.3452 17.8452C15.6577 17.5326 15.8333 17.1087 15.8333 16.6667V5H4.16667ZM6.66667 5V3.33333C6.66667 2.89131 6.84226 2.46738 7.15482 2.15482C7.46738 1.84226 7.89131 1.66667 8.33333 1.66667H11.6667C12.1087 1.66667 12.5326 1.84226 12.8452 2.15482C13.1577 2.46738 13.3333 2.89131 13.3333 3.33333V5"
                  stroke="#F5653E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl p-8 border border-[#E5E6E8] space-y-6">
            {/* Процедура */}
            <div>
              <label className="block text-[#191A1B] text-sm font-medium mb-2">
                Процедура
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] focus:outline-none focus:border-[#F5653E] transition-colors"
              />
            </div>

            {/* Фото процедуры */}
            <div>
              <label className="block text-[#191A1B] text-sm font-medium mb-2">
                Фото процедуры
              </label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-[#FFF8F5] border border-[#E5E6E8] flex items-center justify-center flex-shrink-0">
                  {photo ? (
                    <Image
                      src={photo}
                      alt={name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="20" r="20" fill="#E5E6E8" />
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
                  className="px-4 py-2 rounded-full border border-[#E5E6E8] text-[#686F72] text-sm hover:bg-[#F8F9FA] transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M11.3334 2.00001C11.5086 1.82491 11.7164 1.68605 11.9452 1.59129C12.174 1.49653 12.4193 1.44775 12.6667 1.44775C12.9142 1.44775 13.1595 1.49653 13.3883 1.59129C13.6171 1.68605 13.8249 1.82491 14.0001 2.00001C14.1752 2.17511 14.314 2.38293 14.4088 2.61173C14.5036 2.84053 14.5523 3.08584 14.5523 3.33334C14.5523 3.58084 14.5036 3.82615 14.4088 4.05495C14.314 4.28375 14.1752 4.49157 14.0001 4.66668L5.00008 13.6667L1.33341 14.6667L2.33341 11L11.3334 2.00001Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Новое фото
                </button>
              </div>
            </div>

            {/* Стоимость */}
            <div>
              <label className="block text-[#191A1B] text-sm font-medium mb-2">
                Стоимость
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] focus:outline-none focus:border-[#F5653E] transition-colors"
              />
            </div>

            {/* Адрес */}
            <div>
              <label className="block text-[#191A1B] text-sm font-medium mb-2">
                Адрес
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] focus:outline-none focus:border-[#F5653E] transition-colors"
              />
            </div>

            {/* График работы */}
            <div>
              <label className="block text-[#191A1B] text-sm font-medium mb-2">
                График работы
              </label>
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] focus:outline-none focus:border-[#F5653E] transition-colors"
              />
            </div>

            {/* Специалисты */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-[#191A1B] text-sm font-medium">
                  Специалисты, выполняющие услугу
                </label>
                <button className="text-[#F5653E] text-sm font-medium hover:text-[#E5542D] transition-colors flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 3.33334V12.6667M3.33333 8H12.6667"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  Добавить специалиста
                </button>
              </div>
              <div className="space-y-2">
                {specialists.map((specialist) => (
                  <div
                    key={specialist.id}
                    className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#F8F9FA]"
                  >
                    <span className="text-[#191A1B] text-base">
                      {specialist.name}
                    </span>
                    <button
                      onClick={() => removeSpecialist(specialist.id)}
                      className="text-[#C4C8CA] hover:text-[#F5653E] transition-colors"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M15 5L5 15M5 5L15 15"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* График процедуры */}
            <div>
              <label className="block text-[#191A1B] text-sm font-medium mb-3">
                График процедуры
              </label>

              {/* Онлайн/Оффлайн табы */}
              <div className="inline-flex gap-0 mb-6 bg-[#F8F9FA] rounded-full p-1">
                <button
                  onClick={() => setScheduleType("online")}
                  className={`px-8 py-2.5 rounded-full font-medium text-sm transition-all ${
                    scheduleType === "online"
                      ? "bg-white text-[#191A1B] shadow-sm"
                      : "bg-transparent text-[#686F72]"
                  }`}
                >
                  Онлайн
                </button>
                <button
                  onClick={() => setScheduleType("offline")}
                  className={`px-8 py-2.5 rounded-full font-medium text-sm transition-all ${
                    scheduleType === "offline"
                      ? "bg-white text-[#191A1B] shadow-sm"
                      : "bg-transparent text-[#686F72]"
                  }`}
                >
                  Оффлайн
                </button>
              </div>

              <div className="flex gap-6">
                {/* Календарь */}
                <div
                  className="bg-[#FAFAFA] rounded-3xl border border-[#E5E6E8] p-5 flex-shrink-0"
                  style={{ width: "340px" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <button className="w-8 h-8 hover:bg-white rounded-lg transition-colors flex items-center justify-center">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M10 12L6 8L10 4"
                          stroke="#191A1B"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <span className="text-[#191A1B] font-semibold text-base">
                      {currentMonth}
                    </span>
                    <button className="w-8 h-8 hover:bg-white rounded-lg transition-colors flex items-center justify-center">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M6 4L10 8L6 12"
                          stroke="#191A1B"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 mb-2">
                    {["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"].map((day) => (
                      <div
                        key={day}
                        className="text-center text-[#838A8D] text-xs font-medium h-8 flex items-center justify-center"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {daysInMonth.map((day) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`h-10 rounded-xl text-sm font-medium transition-all ${
                          selectedDays.includes(day)
                            ? "bg-[#F5653E] text-white shadow-sm"
                            : "bg-white hover:bg-[#F8F9FA] text-[#191A1B]"
                        }`}
                      >
                        {day.toString().padStart(2, "0")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Временные слоты */}
                <div className="flex-1 space-y-5">
                  {/* Morning */}
                  <div>
                    <p className="text-[#838A8D] text-sm font-medium mb-3">
                      Morning
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {morningSlots.map((slot, index) => (
                        <button
                          key={slot.time}
                          onClick={() => toggleTimeSlot("morning", index)}
                          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            slot.selected
                              ? "bg-[#F5653E] text-white shadow-sm"
                              : "bg-[#F8F9FA] text-[#686F72] hover:bg-[#E5E6E8]"
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Afternoon */}
                  <div>
                    <p className="text-[#838A8D] text-sm font-medium mb-3">
                      Afternoon
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {afternoonSlots.map((slot, index) => (
                        <button
                          key={slot.time}
                          onClick={() => toggleTimeSlot("afternoon", index)}
                          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            slot.selected
                              ? "bg-[#F5653E] text-white shadow-sm"
                              : "bg-[#F8F9FA] text-[#686F72] hover:bg-[#E5E6E8]"
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Evening */}
                  <div>
                    <p className="text-[#838A8D] text-sm font-medium mb-3">
                      Evening
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {eveningSlots.map((slot, index) => (
                        <button
                          key={slot.time}
                          onClick={() => toggleTimeSlot("evening", index)}
                          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            slot.selected
                              ? "bg-[#F5653E] text-white shadow-sm"
                              : "bg-[#F8F9FA] text-[#686F72] hover:bg-[#E5E6E8]"
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
