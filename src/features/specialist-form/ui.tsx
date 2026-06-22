"use client";

import { FC, SVGProps, useState } from "react";

import Image from "next/image";

import { Button, Dropdown, Input, SegmentedControl, Textarea } from "@/shared";

type WorkExperience = {
  id: string;
  period: string;
  years: string;
  place: string;
  position: string;
};

type Skill = {
  id: string;
  name: string;
};

type TimeSlot = {
  time: string;
  selected: boolean;
};

type Props = {
  initialData?: {
    fullName: string;
    photo?: string;
    specialty: string;
    education: string;
    about: string;
    workExperience: WorkExperience[];
    skills: Skill[];
  };
  onSave?: (data: any) => void;
};

const SPECIALTIES = [
  "Кардиология",
  "Терапия",
  "Хирургия",
  "Педиатрия",
  "Неврология",
];

const PencilIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
    <path
      d="M11.3334 2.00001C11.5086 1.82491 11.7164 1.68605 11.9452 1.59129C12.174 1.49653 12.4193 1.44775 12.6667 1.44775C12.9142 1.44775 13.1595 1.49653 13.3883 1.59129C13.6171 1.68605 13.8249 1.82491 14.0001 2.00001C14.1752 2.17511 14.314 2.38293 14.4088 2.61173C14.5036 2.84053 14.5523 3.08584 14.5523 3.33334C14.5523 3.58084 14.5036 3.82615 14.4088 4.05495C14.314 4.28375 14.1752 4.49157 14.0001 4.66668L5.00008 13.6667L1.33341 14.6667L2.33341 11L11.3334 2.00001Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SpecialistForm: FC<Props> = ({ initialData, onSave }) => {
  const [fullName, setFullName] = useState(initialData?.fullName || "");
  const [photo, setPhoto] = useState(initialData?.photo);
  const [specialty, setSpecialty] = useState(initialData?.specialty || "");
  const [education, setEducation] = useState(initialData?.education || "");
  const [about, setAbout] = useState(initialData?.about || "");
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>(
    initialData?.workExperience || [],
  );
  const [skills, setSkills] = useState<Skill[]>(initialData?.skills || []);
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

  const handleAddExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      period: "2020-2026",
      years: "(6 лет)",
      place: "Новое место работы",
      position: "Должность",
    };
    setWorkExperience([...workExperience, newExp]);
  };

  const handleRemoveExperience = (id: string) => {
    setWorkExperience(workExperience.filter((exp) => exp.id !== id));
  };

  const handleAddSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: "Новый навык",
    };
    setSkills([...skills, newSkill]);
  };

  const handleRemoveSkill = (id: string) => {
    setSkills(skills.filter((skill) => skill.id !== id));
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

  const daysInMonth = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 21,
  ];

  return (
    <div className="space-y-6">
      {/* ФИО */}
      <div>
        <Input
          label="ФИО"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Введите ФИО"
        />
      </div>

      {/* Фото специалиста */}
      <div>
        <label className="block text-foreground text-sm font-medium mb-2">
          Фото специалиста
        </label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-primary-tint flex items-center justify-center shrink-0">
            {photo ? (
              <Image
                src={photo}
                alt={fullName}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="20" fill={colors.border} />
                <path
                  d="M20 10C14.48 10 10 14.48 10 20C10 25.52 14.48 30 20 30C25.52 30 30 25.52 30 20C30 14.48 25.52 10 20 10ZM20 15C21.66 15 23 16.34 23 18C23 19.66 21.66 21 20 21C18.34 21 17 19.66 17 18C17 16.34 18.34 15 20 15ZM20 28C17.33 28 14.94 26.66 13.5 24.65C13.53 22.58 17.6 21.43 20 21.43C22.38 21.43 26.47 22.58 26.5 24.65C25.06 26.66 22.67 28 20 28Z"
                  fill={colors.dim}
                />
              </svg>
            )}
          </div>
          <Button variant="outline" size="sm" IconLeft={PencilIcon}>
            Новое фото
          </Button>
        </div>
      </div>

      {/* Специализация */}
      <Dropdown
        label="Специализация"
        placeholder="Выберите из списка"
        options={SPECIALTIES.map((spec) => ({ label: spec, value: spec }))}
        value={specialty}
        onChange={(val) => setSpecialty(val)}
      />

      {/* Образование */}
      <div>
        <Textarea
          label="Образование"
          value={education}
          onChange={(e) => setEducation(e.target.value)}
          rows={3}
          placeholder="Введите информацию об образовании"
        />
      </div>

      {/* О специалисте */}
      <div>
        <Textarea
          label="О специалисте"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          rows={8}
          placeholder="Расскажите о специалисте"
        />
      </div>

      {/* Опыт работы */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-foreground text-sm font-medium">
            Опыт работы
          </label>
          <button
            onClick={handleAddExperience}
            className="text-primary text-sm font-medium hover:text-primary-dark transition-colors flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3.33334V12.6667M3.33333 8H12.6667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Добавить
          </button>
        </div>
        <div className="space-y-3">
          {workExperience.map((exp) => (
            <div key={exp.id} className="flex items-start gap-3">
              <div className="w-0.5 h-16 bg-[#FFE5E0] rounded-full shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <p className="text-primary text-sm mb-1">
                  {exp.period} <span className="text-primary">{exp.years}</span>
                </p>
                <p className="text-foreground font-medium text-base mb-0.5">
                  {exp.place}
                </p>
                <p className="text-secondary text-sm">{exp.position}</p>
              </div>
              <button
                onClick={() => handleRemoveExperience(exp.id)}
                className="text-dim hover:text-primary transition-colors mt-1"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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

      {/* Профессиональные навыки */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-foreground text-sm font-medium">
            Профессиональные навыки
          </label>
          <button
            onClick={handleAddSkill}
            className="text-primary text-sm font-medium hover:text-primary-dark transition-colors flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3.33334V12.6667M3.33333 8H12.6667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Добавить
          </button>
        </div>
        <div className="space-y-2">
          {skills.map((skill) => (
            <div key={skill.id} className="flex items-start gap-3">
              <div className="w-0.5 h-6 bg-[#FFE5E0] rounded-full shrink-0 mt-1" />
              <p className="flex-1 text-foreground text-base">{skill.name}</p>
              <button
                onClick={() => handleRemoveSkill(skill.id)}
                className="text-dim hover:text-primary transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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

      {/* Записи */}
      <div>
        <label className="block text-foreground text-sm font-medium mb-3">
          Записи
        </label>

        {/* Онлайн/Оффлайн табы */}
        <div className="mb-6">
          <SegmentedControl
            options={[
              { value: "online" as const, label: "Онлайн" },
              { value: "offline" as const, label: "Оффлайн" },
            ]}
            value={scheduleType}
            onChange={setScheduleType}
          />
        </div>

        <div className="flex gap-6">
          {/* Календарь */}
          <div
            className="bg-[#FAFAFA] rounded-3xl border border-border p-5 shrink-0"
            style={{ width: "340px" }}
          >
            <div className="flex items-center justify-between mb-4">
              <button className="w-8 h-8 hover:bg-white rounded-lg transition-colors flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M10 12L6 8L10 4"
                    stroke={colors.foreground}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <span className="text-foreground font-semibold text-base">
                {currentMonth}
              </span>
              <button className="w-8 h-8 hover:bg-white rounded-lg transition-colors flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 4L10 8L6 12"
                    stroke={colors.foreground}
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
                  className="text-center text-muted text-xs font-medium h-8 flex items-center justify-center"
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
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white hover:bg-surface text-foreground"
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
              <p className="text-muted text-sm font-medium mb-3">Morning</p>
              <div className="flex gap-2 flex-wrap">
                {morningSlots.map((slot, index) => (
                  <button
                    key={slot.time}
                    onClick={() => toggleTimeSlot("morning", index)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      slot.selected
                        ? "bg-primary text-white shadow-sm"
                        : "bg-surface text-secondary hover:bg-border"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>

            {/* Afternoon */}
            <div>
              <p className="text-muted text-sm font-medium mb-3">Afternoon</p>
              <div className="flex gap-2 flex-wrap">
                {afternoonSlots.map((slot, index) => (
                  <button
                    key={slot.time}
                    onClick={() => toggleTimeSlot("afternoon", index)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      slot.selected
                        ? "bg-primary text-white shadow-sm"
                        : "bg-surface text-secondary hover:bg-border"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>

            {/* Evening */}
            <div>
              <p className="text-muted text-sm font-medium mb-3">Evening</p>
              <div className="flex gap-2 flex-wrap">
                {eveningSlots.map((slot, index) => (
                  <button
                    key={slot.time}
                    onClick={() => toggleTimeSlot("evening", index)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      slot.selected
                        ? "bg-primary text-white shadow-sm"
                        : "bg-surface text-secondary hover:bg-border"
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
  );
};
