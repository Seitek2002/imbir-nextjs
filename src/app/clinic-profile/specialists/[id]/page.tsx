"use client";

import { useParams, useRouter } from "next/navigation";

import { ClinicSidebar } from "@/widgets/clinic-sidebar";

import { SpecialistForm } from "@/features/specialist-form";

import { MOCK_CLINIC_PROFILE } from "@/entities/clinic-profile";

const MOCK_SPECIALIST_DATA = {
  fullName: "Калиева Айгерим Бакытовна",
  photo: "/doctor-photo.jpg",
  specialty: "Кардиология",
  education:
    "Кыргызская Государственная Медицинская Академия, факультет лечебного дела (окончил с отличием).",
  about:
    "Опытный кардиолог с более 14 летним практическим Специализируется на диагностике и лечении сердечно-сосудистых заболеваний, применяет современные методы обследования и индивидуальные программы терапии. Имеет внимательным отношением к каждому пациенту, умением объяснить сложные вещи просто и взаимо и всегда ставит на первое место интересы и здоровье пациента. Регулярно повышает квалификацию, участвует в международных конференциях и ведёт просветительскую работу по профилактике сердечных заболеваний.",
  workExperience: [
    {
      id: "1",
      period: "2012-2020",
      years: "(8 лет)", // ← ДОБАВИЛИ
      place: "Национальный центр кардиологии",
      position: "Кардиолог",
    },
    {
      id: "2",
      period: "2020-2026",
      years: "(6 лет)", // ← ДОБАВИЛИ
      place: "Частная клиника «Медлайн»",
      position: "Ведущий специалист",
    },
  ],
  skills: [
    {
      id: "1",
      name: "Диагностика и лечение заболеваний сердечно-сосудистой системы",
      checked: true,
    },
    {
      id: "2",
      name: "ЭКГ, ЭХО-КГ и нагрузочные тесты",
      checked: true,
    },
    {
      id: "3",
      name: "Составление индивидуальных программ реабилитации после операций на сердце",
      checked: true,
    },
    {
      id: "4",
      name: "Лечение артериальной гипертонии, аритмий и ишемической болезни сердца",
      checked: true,
    },
  ],
};

export default function SpecialistDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const handleSave = () => {
    console.log("Save specialist data");
    router.push("/clinic-profile/specialists");
  };

  const handleDelete = () => {
    if (confirm("Вы уверены, что хотите удалить специалиста?")) {
      console.log("Delete specialist", id);
      router.push("/clinic-profile/specialists");
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
          <div className="bg-white rounded-3xl p-8 border border-[#E5E6E8]">
            <SpecialistForm
              initialData={MOCK_SPECIALIST_DATA}
              onSave={handleSave}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
