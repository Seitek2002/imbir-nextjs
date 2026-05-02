"use client";

import { useRef, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { ClinicSidebar } from "@/widgets/clinic-sidebar";

import { MOCK_CLINIC_PROFILE } from "@/entities/clinic-profile";

type WorkSchedule = {
  day: string;
  from: string;
  to: string;
  enabled: boolean;
};

type WorkExperience = {
  clinic: string;
  specialty: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  currentlyWorking: boolean;
};

type Skill = {
  id: string;
  text: string;
};

export default function NewSpecialistPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<string>();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [experienceYears, setExperienceYears] = useState("0");

  const [schedule, setSchedule] = useState<WorkSchedule[]>([
    { day: "ПН", from: "00:00", to: "00:00", enabled: false },
    { day: "ВТ", from: "00:00", to: "00:00", enabled: false },
    { day: "СР", from: "00:00", to: "00:00", enabled: false },
    { day: "ЧТ", from: "00:00", to: "00:00", enabled: false },
    { day: "ПТ", from: "00:00", to: "00:00", enabled: false },
    { day: "СБ", from: "00:00", to: "00:00", enabled: false },
    { day: "ВС", from: "00:00", to: "00:00", enabled: false },
  ]);

  const [lunchBreak, setLunchBreak] = useState({ from: "00:00", to: "00:00" });

  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([
    {
      clinic: "",
      specialty: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      currentlyWorking: false,
    },
  ]);

  const [education, setEducation] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<Skill[]>([]);

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

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    console.log("Save new specialist");
    router.push("/clinic-profile/specialists");
  };

  const updateSchedule = (
    index: number,
    field: "from" | "to" | "enabled",
    value: string | boolean,
  ) => {
    setSchedule((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addWorkExperience = () => {
    setWorkExperiences([
      ...workExperiences,
      {
        clinic: "",
        specialty: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
        currentlyWorking: false,
      },
    ]);
  };

  const updateWorkExperience = (
    index: number,
    field: keyof WorkExperience,
    value: string | boolean,
  ) => {
    setWorkExperiences((prev) =>
      prev.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp)),
    );
  };

  const addSkill = () => {
    setSkills([...skills, { id: Date.now().toString(), text: "" }]);
  };

  const updateSkill = (id: string, text: string) => {
    setSkills((prev) =>
      prev.map((skill) => (skill.id === id ? { ...skill, text } : skill)),
    );
  };

  const removeSkill = (id: string) => {
    setSkills((prev) => prev.filter((skill) => skill.id !== id));
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
              Добавить специалиста
            </h2>

            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-full bg-[#F5653E] text-white font-medium hover:bg-[#E5542D] transition-colors"
            >
              Сохранить
            </button>
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl p-8 border border-[#E5E6E8] space-y-8">
            {/* Личные данные */}
            <div>
              <h3 className="text-[#191A1B] font-semibold text-lg mb-4">
                Личные данные
              </h3>

              {/* Фото */}
              <div className="mb-4">
                <label className="block text-[#191A1B] text-sm font-medium mb-2">
                  Фото специалиста
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#FFF8F5] border border-[#E5E6E8] flex items-center justify-center flex-shrink-0">
                    {photo ? (
                      <Image
                        src={photo}
                        alt="Фото"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                        fill="none"
                      >
                        <circle cx="20" cy="20" r="20" fill="#E5E6E8" />
                        <path
                          d="M20 10C14.48 10 10 14.48 10 20C10 25.52 14.48 30 20 30C25.52 30 30 25.52 30 20C30 14.48 25.52 10 20 10ZM20 15C21.66 15 23 16.34 23 18C23 19.66 21.66 21 20 21C18.34 21 17 19.66 17 18C17 16.34 18.34 15 20 15ZM20 28C17.33 28 14.94 26.66 13.5 24.65C13.53 22.58 17.6 21.43 20 21.43C22.38 21.43 26.47 22.58 26.5 24.65C25.06 26.66 22.67 28 20 28Z"
                          fill="#C4C8CA"
                        />
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
                    onClick={handleAddPhoto}
                    className="px-4 py-2 rounded-full border border-[#E5E6E8] text-[#686F72] text-sm hover:bg-[#F8F9FA] transition-colors flex items-center gap-2"
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
              </div>

              {/* Имя и Фамилия */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[#191A1B] text-sm font-medium mb-2">
                    Имя специалиста
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Введите имя"
                    className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#191A1B] text-sm font-medium mb-2">
                    Фамилия специалиста
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Введите фамилию"
                    className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Специализация */}
            <div>
              <label className="block text-[#191A1B] text-sm font-medium mb-2">
                Специализация
              </label>
              <div className="relative">
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#C4C8CA] focus:text-[#191A1B] focus:outline-none focus:border-[#F5653E] transition-colors appearance-none bg-white cursor-pointer"
                >
                  <option value="">Выберите из списка</option>
                  <option value="Кардиология">Кардиология</option>
                  <option value="Терапия">Терапия</option>
                  <option value="Хирургия">Хирургия</option>
                </select>
                <svg
                  className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="#686F72"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Стаж работы */}
            <div>
              <label className="block text-[#191A1B] text-sm font-medium mb-2">
                Стаж работы
              </label>
              <input
                type="text"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="0 лет"
                className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] transition-colors"
              />
            </div>

            {/* График работы */}
            <div>
              <h3 className="text-[#191A1B] font-semibold text-lg mb-4">
                График работы
              </h3>
              <div className="space-y-3">
                {schedule.map((item, index) => (
                  <div key={item.day} className="flex items-center gap-4">
                    <span className="text-[#191A1B] text-sm font-medium w-8">
                      {item.day}
                    </span>
                    <input
                      type="time"
                      value={item.from}
                      onChange={(e) =>
                        updateSchedule(index, "from", e.target.value)
                      }
                      className="w-28 px-3 py-2 rounded-xl border border-[#E5E6E8] text-[#C4C8CA] text-sm focus:outline-none focus:border-[#F5653E] transition-colors"
                    />
                    <span className="text-[#838A8D]">—</span>
                    <input
                      type="time"
                      value={item.to}
                      onChange={(e) =>
                        updateSchedule(index, "to", e.target.value)
                      }
                      className="w-28 px-3 py-2 rounded-xl border border-[#E5E6E8] text-[#C4C8CA] text-sm focus:outline-none focus:border-[#F5653E] transition-colors"
                    />
                  </div>
                ))}

                {/* Обеденный перерыв */}
                <div className="flex items-center gap-4 pt-1">
                  <span className="text-[#191A1B] text-sm font-medium whitespace-nowrap">
                    Обеденный перерыв
                  </span>
                  <input
                    type="time"
                    value={lunchBreak.from}
                    onChange={(e) =>
                      setLunchBreak({ ...lunchBreak, from: e.target.value })
                    }
                    className="w-28 px-3 py-2 rounded-xl border border-[#E5E6E8] text-[#C4C8CA] text-sm focus:outline-none focus:border-[#F5653E] transition-colors"
                  />
                  <span className="text-[#838A8D]">—</span>
                  <input
                    type="time"
                    value={lunchBreak.to}
                    onChange={(e) =>
                      setLunchBreak({ ...lunchBreak, to: e.target.value })
                    }
                    className="w-28 px-3 py-2 rounded-xl border border-[#E5E6E8] text-[#C4C8CA] text-sm focus:outline-none focus:border-[#F5653E] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Опыт работы */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#191A1B] font-semibold text-lg">
                  Опыт работы
                </h3>
                <button
                  onClick={addWorkExperience}
                  className="text-[#F5653E] text-sm font-medium hover:text-[#E5542D] transition-colors flex items-center gap-1"
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

              {workExperiences.map((exp, index) => (
                <div key={index} className="space-y-4 mb-6">
                  <div>
                    <label className="block text-[#191A1B] text-sm font-medium mb-2">
                      Клиника
                    </label>
                    <input
                      type="text"
                      value={exp.clinic}
                      onChange={(e) =>
                        updateWorkExperience(index, "clinic", e.target.value)
                      }
                      placeholder="Введите название клиники"
                      className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[#191A1B] text-sm font-medium mb-2">
                      Специализация
                    </label>
                    <div className="relative">
                      <select
                        value={exp.specialty}
                        onChange={(e) =>
                          updateWorkExperience(
                            index,
                            "specialty",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#C4C8CA] focus:text-[#191A1B] focus:outline-none focus:border-[#F5653E] transition-colors appearance-none bg-white cursor-pointer"
                      >
                        <option value="">Выберите из списка</option>
                        <option value="Кардиология">Кардиология</option>
                        <option value="Терапия">Терапия</option>
                      </select>
                      <svg
                        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M5 7.5L10 12.5L15 7.5"
                          stroke="#686F72"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#191A1B] text-sm font-medium mb-2">
                        Начало
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <select
                            value={exp.startMonth}
                            onChange={(e) =>
                              updateWorkExperience(
                                index,
                                "startMonth",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#C4C8CA] focus:text-[#191A1B] focus:outline-none focus:border-[#F5653E] transition-colors appearance-none bg-white cursor-pointer"
                          >
                            <option value="">Месяц</option>
                            <option value="1">Январь</option>
                            <option value="2">Февраль</option>
                          </select>
                          <svg
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M4 6L8 10L12 6"
                              stroke="#686F72"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={exp.startYear}
                          onChange={(e) =>
                            updateWorkExperience(
                              index,
                              "startYear",
                              e.target.value,
                            )
                          }
                          placeholder="Год"
                          className="w-24 px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#191A1B] text-sm font-medium mb-2">
                        Окончание
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <select
                            value={exp.endMonth}
                            onChange={(e) =>
                              updateWorkExperience(
                                index,
                                "endMonth",
                                e.target.value,
                              )
                            }
                            disabled={exp.currentlyWorking}
                            className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#C4C8CA] focus:text-[#191A1B] focus:outline-none focus:border-[#F5653E] transition-colors appearance-none bg-white cursor-pointer disabled:bg-[#F8F9FA] disabled:cursor-not-allowed"
                          >
                            <option value="">Месяц</option>
                            <option value="1">Январь</option>
                            <option value="2">Февраль</option>
                          </select>
                          <svg
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M4 6L8 10L12 6"
                              stroke="#686F72"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          value={exp.endYear}
                          onChange={(e) =>
                            updateWorkExperience(
                              index,
                              "endYear",
                              e.target.value,
                            )
                          }
                          placeholder="Год"
                          disabled={exp.currentlyWorking}
                          className="w-24 px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] transition-colors disabled:bg-[#F8F9FA] disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exp.currentlyWorking}
                      onChange={(e) =>
                        updateWorkExperience(
                          index,
                          "currentlyWorking",
                          e.target.checked,
                        )
                      }
                      className="w-5 h-5 rounded border-2 border-[#E5E6E8] text-[#F5653E] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-[#191A1B] text-sm">
                      Работаю сейчас
                    </span>
                  </label>
                </div>
              ))}
            </div>

            {/* Дополнительные данные */}
            <div>
              <h3 className="text-[#191A1B] font-semibold text-lg mb-4">
                Дополнительные данные
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[#191A1B] text-sm font-medium mb-2">
                    Образование
                  </label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="Введите название учебного заведения"
                    className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[#191A1B] text-sm font-medium mb-2">
                    Описание
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Введите информацию о враче"
                    className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] resize-none focus:outline-none focus:border-[#F5653E] transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[#191A1B] text-sm font-medium">
                      Профессиональные навыки
                    </label>
                    <button
                      onClick={addSkill}
                      className="text-[#F5653E] text-sm font-medium hover:text-[#E5542D] transition-colors flex items-center gap-1"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
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
                  {skills.length === 0 ? (
                    <input
                      type="text"
                      placeholder="Введите навык"
                      className="w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] transition-colors"
                      readOnly
                    />
                  ) : (
                    <div className="space-y-2">
                      {skills.map((skill) => (
                        <div key={skill.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={skill.text}
                            onChange={(e) =>
                              updateSkill(skill.id, e.target.value)
                            }
                            placeholder="Введите навык"
                            className="flex-1 px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] transition-colors"
                          />
                          <button
                            onClick={() => removeSkill(skill.id)}
                            className="w-10 h-10 flex items-center justify-center text-[#C4C8CA] hover:text-[#F5653E] transition-colors"
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
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
