"use client";

import { FC } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { DoctorSidebar } from "@/widgets/doctor-sidebar";

import { MOCK_DOCTOR_PROFILE } from "@/entities/doctor-profile";

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M15 18L9 12L15 6"
      stroke="#191A1B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M7.5 5L12.5 10L7.5 15"
      stroke="#C4C8CA"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SECTIONS = [
  {
    href: "/doctor-profile/my-data/basic",
    label: "Основная информация",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 10C12.2091 10 14 8.20914 14 6C14 3.79086 12.2091 2 10 2C7.79086 2 6 3.79086 6 6C6 8.20914 7.79086 10 10 10Z"
          stroke="#F5653E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 18C3 15.2386 6.13401 13 10 13C13.866 13 17 15.2386 17 18"
          stroke="#F5653E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/doctor-profile/my-data/professional",
    label: "Профессиональные данные",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M6.66667 2.5H13.3333C14.2538 2.5 15 3.24619 15 4.16667V17.5L10 15L5 17.5V4.16667C5 3.24619 5.74619 2.5 6.66667 2.5Z"
          stroke="#F5653E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/doctor-profile/my-data/education",
    label: "Образование",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 2L2 6.5L10 11L18 6.5L10 2Z"
          stroke="#F5653E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2 6.5V13M6 8.5V14.5C6 14.5 7.5 16.5 10 16.5C12.5 16.5 14 14.5 14 14.5V8.5"
          stroke="#F5653E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/doctor-profile/my-data/documents",
    label: "Сертификаты и документы",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M11.667 2.5H5.833C5.392 2.5 4.967 2.675 4.655 2.988C4.342 3.3 4.167 3.725 4.167 4.167V15.833C4.167 16.275 4.342 16.7 4.655 17.012C4.967 17.325 5.392 17.5 5.833 17.5H14.167C14.608 17.5 15.033 17.325 15.345 17.012C15.658 16.7 15.833 16.275 15.833 15.833V6.667L11.667 2.5Z"
          stroke="#F5653E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.667 2.5V6.667H15.833M7.5 10H12.5M7.5 13.333H12.5"
          stroke="#F5653E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export const DoctorMyDataPage: FC = () => {
  const router = useRouter();
  const d = MOCK_DOCTOR_PROFILE;

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-[#E5E6E8]">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F8F9FA] transition-colors"
        >
          <BackIcon />
        </button>
        <h1 className="text-lg font-semibold text-[#191A1B]">Мои данные</h1>
        <div className="w-10" />
      </div>

      <div className="max-w-360 mx-auto px-4 lg:px-10 py-4 lg:py-8">
        <h1 className="text-[40px] font-semibold text-[#191A1B] mb-8 hidden lg:block">
          Мой профиль
        </h1>
        <div className="flex gap-6">
          <div className="hidden lg:block">
            <DoctorSidebar
              fullName={d.fullName}
              photo={d.photo}
              specialty={d.specialty}
              rating={d.rating}
            />
          </div>

          <main className="flex-1 min-w-0">
            <h2 className="text-[28px] font-semibold text-[#191A1B] mb-6 hidden lg:block">
              Мои данные
            </h2>

            <nav className="bg-white rounded-3xl border border-[#E5E6E8] p-2 flex flex-col gap-1">
              {SECTIONS.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-[#F8F9FA] transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#FFF8F5] flex items-center justify-center flex-shrink-0">
                    {s.icon}
                  </div>
                  <span className="flex-1 font-medium text-base text-[#191A1B]">
                    {s.label}
                  </span>
                  <ChevronRight />
                </Link>
              ))}
            </nav>
          </main>
        </div>
      </div>
    </div>
  );
};
