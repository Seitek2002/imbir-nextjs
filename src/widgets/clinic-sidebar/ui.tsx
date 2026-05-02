"use client";

import { FC } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutIcon, StarIcon } from "@/shared/assets";

type Props = {
  clinicName: string;
  clinicLogo?: string;
  rating?: number;
};

const MENU_ITEMS = [
  {
    href: "/clinic-profile",
    label: "Моя клиника",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M4.16667 7.5L10 3.33333L15.8333 7.5V15.8333C15.8333 16.2754 15.6577 16.6993 15.3452 17.0118C15.0326 17.3244 14.6087 17.5 14.1667 17.5H5.83333C5.39131 17.5 4.96738 17.3244 4.65482 17.0118C4.34226 16.6993 4.16667 16.2754 4.16667 15.8333V7.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/clinic-profile/specialists",
    label: "Мои специалисты",
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
    href: "/clinic-profile/procedures",
    label: "Мои процедуры",
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
          d="M13.3333 0.833336V4.16667M6.66667 0.833336V4.16667M2.5 7.5H17.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export const ClinicSidebar: FC<Props> = ({
  clinicName,
  clinicLogo,
  rating,
}) => {
  const pathname = usePathname();

  return (
    <aside className="w-72 shrink-0 hidden lg:block">
      {/* Clinic Card */}
      <Link
        href="/clinic-profile"
        className="bg-white rounded-3xl p-5 flex items-center gap-4 mb-4 border border-[#E5E6E8] hover:border-[#F5653E] transition-colors"
      >
        <div className="w-14 h-14 rounded-full overflow-hidden bg-linear-to-br from-[#F5653E] to-[#FF8A6B] flex items-center justify-center flex-shrink-0">
          {clinicLogo ? (
            <Image
              src={clinicLogo}
              alt={clinicName}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-xl font-bold">
              {clinicName.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#191A1B] font-semibold text-base truncate">
            {clinicName}
          </p>
          {rating && (
            <div className="flex items-center gap-1 mt-0.5">
              <StarIcon className="w-4 h-4 text-[#F5653E]" />
              <span className="text-[#F5653E] text-sm font-medium">
                {rating}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Menu */}
      <nav className="bg-white rounded-3xl p-2 flex flex-col gap-1 mb-4">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors ${
                isActive ? "bg-[#FFF8F5]" : "hover:bg-[#F8F9FA]"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isActive ? "bg-[#F5653E]" : "bg-[#FFF8F5]"
                }`}
              >
                <div
                  className={
                    isActive
                      ? "[&_path]:stroke-white"
                      : "[&_path]:stroke-[#F5653E]"
                  }
                >
                  {item.icon}
                </div>
              </div>
              <span
                className={`flex-1 font-medium text-base ${
                  isActive ? "text-[#191A1B]" : "text-[#686F72]"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button className="bg-white rounded-3xl px-6 py-4 flex items-center gap-3 text-[#686F72] hover:bg-[#F8F9FA] transition-colors w-full">
        <div className="w-9 h-9 rounded-xl bg-[#FFF8F5] flex items-center justify-center flex-shrink-0">
          <LogoutIcon className="w-5 h-5 [&_path]:stroke-[#F5653E]" />
        </div>
        <span className="font-medium text-base">Выйти из профиля</span>
      </button>
    </aside>
  );
};
