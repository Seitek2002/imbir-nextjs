import { FC } from "react";

import Link from "next/link";

import { GlobalSearch } from "@/features";
import { Button, IconBtn } from "@/shared";

import {
  ChatIcon,
  GeoBtnArrowIcon,
  GeoIcon,
  Logo,
  ProfileIcon,
  SearchIcon,
} from "@/shared/assets";

export const DefaultContent: FC<{ searchable?: boolean }> = ({
  searchable,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between w-full">
        <Link href="/">
          <Logo className="w-26.5 h-6.5" />
        </Link>

        <nav className="hidden md:flex text-[#191A1B] text-xs lg:text-base gap-6 items-center">
          <Link href={"#"}>Клиники</Link>
          <Link href={"#"}>Специалисты</Link>
          <Link href={"#"}>Услуги</Link>
          <Link href={"#"}>Блог</Link>
        </nav>

        <div className="hidden md:flex gap-3">
          <Button size="xs">Записаться на приём</Button>
          <GlobalSearch />
          <IconBtn variant="outline" size="sm">
            <ChatIcon className="size-5" />
          </IconBtn>
          <IconBtn variant="outline" size="sm">
            <ProfileIcon className="size-5" />
          </IconBtn>
        </div>

        <Button
          IconLeft={GeoIcon}
          IconRight={GeoBtnArrowIcon}
          variant="outline"
          size="sm"
          className="md:hidden"
        >
          Бишкек
        </Button>
      </div>
      {searchable && (
        <div className="w-full flex items-center justify-center mt-4 md:hidden">
          <Link
            href={"/search"}
            className="flex items-center w-full gap-2 border border-[#E5E6E8] px-3 py-2 rounded-full transition-transform active:scale-95"
          >
            <SearchIcon className="size-5" />
            <span className="text-[#686F72] text-base">Поиск клиники</span>
          </Link>
        </div>
      )}
    </div>
  );
};
