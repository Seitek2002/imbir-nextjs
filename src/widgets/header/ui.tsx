import Link from "next/link";

import { Button, IconBtn } from "@/shared";

import {
  ChatIcon,
  GeoBtnArrowIcon,
  GeoIcon,
  Logo,
  ProfileIcon,
  SearchIcon,
  SearchSample,
} from "@/shared/assets";

export const Header = () => {
  return (
    <header className="px-4 pb-4 bg-white md:border md:border-[#E3E4E5] rounded-br-2xl md:rounded-full rounded-bl-2xl md:mt-6 md:py-3 w-full max-w-360 mx-auto">
      <div className="flex items-center justify-between w-full">
        <Logo />

        <nav className="hidden md:flex text-[#191A1B] text-xs lg:text-base gap-6 items-center">
          <Link href={"#"}>Клиники</Link>
          <Link href={"#"}>Специалисты</Link>
          <Link href={"#"}>Услуги</Link>
          <Link href={"#"}>Блог</Link>
        </nav>

        <div className="hidden md:flex gap-3">
          <Button size="xs">Записаться на приём</Button>
          <IconBtn variant="outline" size="sm">
            <SearchIcon className="size-5" />
          </IconBtn>
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
      <div className="flex items-center justify-center mt-4 md:hidden">
        <SearchSample className="active:scale-95 transition-transform" />
      </div>
    </header>
  );
};
