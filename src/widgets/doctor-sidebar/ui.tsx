"use client";

import { FC, useLayoutEffect, useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutIcon, StarIcon } from "@/shared/assets";

type Props = {
  fullName: string;
  photo?: string;
  specialty: string;
  rating: number;
};

const MENU_ITEMS = [
  {
    href: "/doctor-profile",
    label: "Мои данные",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 10C12.2091 10 14 8.20914 14 6C14 3.79086 12.2091 2 10 2C7.79086 2 6 3.79086 6 6C6 8.20914 7.79086 10 10 10Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 18C3 15.2386 6.13401 13 10 13C13.866 13 17 15.2386 17 18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/doctor-profile/appointments",
    label: "Записи",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M13.3333 0.833336V4.16667M6.66667 0.833336V4.16667M2.5 7.5H17.5M4.16667 2.5H15.8333C16.7538 2.5 17.5 3.24619 17.5 4.16667V15.8333C17.5 16.7538 16.7538 17.5 15.8333 17.5H4.16667C3.24619 17.5 2.5 16.7538 2.5 15.8333V4.16667C2.5 3.24619 3.24619 2.5 4.16667 2.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/doctor-profile/patients",
    label: "Пациенты",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M14.1667 17.5V15.8333C14.1667 14.9493 13.8155 14.1014 13.1904 13.4763C12.5652 12.8512 11.7174 12.5 10.8333 12.5H4.16667C3.28261 12.5 2.43477 12.8512 1.80965 13.4763C1.18453 14.1014 0.833336 14.9493 0.833336 15.8333V17.5M19.1667 17.5V15.8333C19.1662 15.0948 18.9204 14.3773 18.4679 13.7936C18.0154 13.2099 17.3819 12.793 16.6667 12.6083M13.3333 2.60833C14.0503 2.79192 14.6858 3.20892 15.1396 3.7936C15.5935 4.37827 15.8399 5.09736 15.8399 5.8375C15.8399 6.57764 15.5935 7.29673 15.1396 7.8814C14.6858 8.46608 14.0503 8.88308 13.3333 9.06667M10.8333 5.83333C10.8333 7.67428 9.34095 9.16667 7.5 9.16667C5.65905 9.16667 4.16667 7.67428 4.16667 5.83333C4.16667 3.99238 5.65905 2.5 7.5 2.5C9.34095 2.5 10.8333 3.99238 10.8333 5.83333Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/doctor-profile/services",
    label: "Услуги",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M15.8333 2.5H4.16667C3.24619 2.5 2.5 3.24619 2.5 4.16667V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V4.16667C17.5 3.24619 16.7538 2.5 15.8333 2.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 6.66667V13.3333M6.66667 10H13.3333"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/doctor-profile/reviews",
    label: "Отзывы",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 1.66667L12.575 6.88334L18.3333 7.72501L14.1667 11.7833L15.15 17.5167L10 14.8083L4.85 17.5167L5.83333 11.7833L1.66667 7.72501L7.425 6.88334L10 1.66667Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export const DoctorSidebar: FC<Props> = ({
  fullName,
  photo,
  specialty,
  rating,
}) => {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState({ top: 0, height: 0 });

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const active = nav.querySelector('[data-active="true"]') as HTMLElement;
    if (!active) return;
    setIndicator({ top: active.offsetTop, height: active.offsetHeight });
  }, [pathname]);

  return (
    <aside className="w-72 shrink-0 hidden lg:block">
      <Link
        href="/doctor-profile"
        className="bg-white rounded-3xl p-5 flex items-center gap-4 mb-4 border border-[#E5E6E8] hover:border-[#F5653E] transition-colors"
      >
        <div className="w-14 h-14 rounded-full overflow-hidden bg-linear-to-br from-[#F5653E] to-[#FF8A6B] flex items-center justify-center shrink-0">
          {photo ? (
            <Image
              src={photo}
              alt={fullName}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-xl font-bold">
              {fullName.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#191A1B] font-semibold text-base truncate">
            {fullName}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <StarIcon className="w-4 h-4 text-[#F5653E]" />
            <span className="text-[#F5653E] text-sm font-medium">{rating}</span>
            <span className="text-[#838A8D] text-sm ml-1">{specialty}</span>
          </div>
        </div>
      </Link>

      <nav
        ref={navRef}
        className="bg-white rounded-3xl p-2 flex flex-col gap-1 mb-4 relative"
      >
        <div
          className="absolute inset-x-2 rounded-2xl bg-[#FFF8F5] transition-all duration-200 ease-out pointer-events-none"
          style={{ top: indicator.top, height: indicator.height }}
        />

        {MENU_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/doctor-profile" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive ? "true" : undefined}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl relative z-10 ${!isActive && "hover:bg-[#F8F9FA]"}`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${isActive ? "bg-[#F5653E] text-white" : "bg-[#FFF8F5] text-[#F5653E]"}`}
              >
                {item.icon}
              </div>
              <span
                className={`flex-1 font-medium text-base transition-colors duration-200 ${isActive ? "text-[#191A1B]" : "text-[#686F72]"}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <button className="bg-white rounded-3xl px-6 py-4 flex items-center gap-3 text-[#686F72] hover:bg-[#F8F9FA] transition-colors w-full">
        <div className="w-9 h-9 rounded-xl bg-[#FFF8F5] flex items-center justify-center shrink-0 text-[#F5653E]">
          <LogoutIcon className="w-5 h-5" />
        </div>
        <span className="font-medium text-base">Выйти из профиля</span>
      </button>
    </aside>
  );
};
