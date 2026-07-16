"use client";

import { FC } from "react";

import Link from "next/link";

import { ChevronRightIcon } from "@/shared/assets/icons";
import { colors } from "@/shared/config";

type HubItem = { href: string; label: string; icon: React.ReactNode };

const ITEMS: HubItem[] = [
  {
    href: "/clinic-profile/basic-info",
    label: "Основная информация",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M4.16667 7.5L10 3.33333L15.8333 7.5V15.8333C15.8333 16.2754 15.6577 16.6993 15.3452 17.0118C15.0326 17.3244 14.6087 17.5 14.1667 17.5H5.83333C5.39131 17.5 4.96738 17.3244 4.65482 17.0118C4.34226 16.6993 4.16667 16.2754 4.16667 15.8333V7.5Z"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/clinic-profile/location",
    label: "Локация и контакты",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M6.14417 9.17667C7.036 10.9942 8.514 12.4675 10.335 13.3517C10.4696 13.4153 10.6188 13.4412 10.7669 13.4267C10.9151 13.4121 11.0565 13.3576 11.1763 13.2692L13.8225 11.325C13.9384 11.2402 14.0737 11.1859 14.216 11.1671C14.3583 11.1483 14.5031 11.1656 14.637 11.2175L19.6108 13.1642C19.7852 13.2334 19.9331 13.3563 20.0329 13.5152C20.1326 13.674 20.179 13.8607 20.1654 14.0475C20.0563 15.2196 19.5031 16.3057 18.6193 17.088C17.7355 17.8702 16.5875 18.2903 15.4108 18.2617C11.9895 18.2617 8.70732 16.9033 6.28698 14.483C3.86665 12.0627 2.50823 8.78047 2.50823 5.35917C2.47966 4.18247 2.89975 3.03453 3.68199 2.15069C4.46423 1.26685 5.55029 0.713729 6.72239 0.604584C6.90921 0.590994 7.09595 0.637345 7.25479 0.737132C7.41363 0.836919 7.53649 0.984819 7.60573 1.15917L9.55573 6.14375C9.6073 6.27632 9.62438 6.4198 9.60543 6.56081C9.58648 6.70182 9.53211 6.83568 9.44739 6.94958L7.51073 9.63459C7.42622 9.75378 7.37547 9.89354 7.36384 10.0392C7.35221 10.1849 7.38014 10.331 7.44489 10.4622"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/clinic-profile/schedule",
    label: "Расписание",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 5V10L13.3333 11.6667M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/clinic-profile/legal",
    label: "Юридическая информация",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M11 1.66667H5C4.55797 1.66667 4.13405 1.84226 3.82149 2.15482C3.50893 2.46738 3.33333 2.89131 3.33333 3.33333V16.6667C3.33333 17.1087 3.50893 17.5326 3.82149 17.8452C4.13405 18.1577 4.55797 18.3333 5 18.3333H15C15.442 18.3333 15.866 18.1577 16.1785 17.8452C16.4911 17.5326 16.6667 17.1087 16.6667 16.6667V7.5L11 1.66667Z"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.8333 1.66667V6.66667C10.8333 7.10869 11.0089 7.53262 11.3215 7.84518C11.634 8.15774 12.058 8.33333 12.5 8.33333H17.5"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/clinic-profile/specialization",
    label: "Специализация и услуги",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M15.8333 2.5H4.16667C3.24619 2.5 2.5 3.24619 2.5 4.16667V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V4.16667C17.5 3.24619 16.7538 2.5 15.8333 2.5Z"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 6.66667V13.3333M6.66667 10H13.3333"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/clinic-profile/equipment",
    label: "Оборудование и условия",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M17.5 8.33333C17.5 13.75 10 17.5 10 17.5C10 17.5 2.5 13.75 2.5 8.33333C2.5 6.83333 3.33333 5.41667 4.58333 4.66667C5.83333 3.91667 7.5 4.16667 8.75 5.41667L10 6.66667L11.25 5.41667C12.5 4.16667 14.1667 3.91667 15.4167 4.66667C16.6667 5.41667 17.5 6.83333 17.5 8.33333Z"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

// Мобильный хаб «Моя клиника»: только список секций-ссылок, без статистики и
// формы — на десктопе вместо этого показывается единая страница со всеми
// секциями сразу (см. ClinicProfilePage).
export const ClinicProfileHub: FC = () => (
  <div className="bg-white rounded-3xl border border-border overflow-hidden">
    {ITEMS.map((item, i) => (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3 px-4 py-4 hover:bg-surface transition-colors ${
          i !== ITEMS.length - 1 ? "border-b border-background" : ""
        }`}
      >
        <div className="w-9 h-9 rounded-xl bg-primary-tint flex items-center justify-center shrink-0">
          {item.icon}
        </div>
        <span className="flex-1 font-medium text-base text-foreground">
          {item.label}
        </span>
        <ChevronRightIcon className="w-5 h-5 text-dim" />
      </Link>
    ))}
  </div>
);
