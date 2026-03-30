import Link from "next/link";

import { Button } from "@/shared";

import {
  FilterSample,
  GeoBtnArrowIcon,
  GeoIcon,
  Logo,
  SearchSample,
} from "@/shared/assets";

export const Header = () => {
  return (
    <header className="px-4 pb-4 bg-white rounded-br-2xl rounded-bl-2xl">
      <div className="flex items-center justify-between">
        <Logo />

        <nav className="hidden md:flex text-[#191A1B] text-base gap-6 items-center">
          <Link href={"#"}>Клиники</Link>
          <Link href={"#"}>Специалисты</Link>
          <Link href={"#"}>Услуги</Link>
          <Link href={"#"}>Блог</Link>
        </nav>

        <div className="hidden md:flex">
          <Button size="md">Записаться на приём</Button>
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
      <div className="flex items-center justify-between mt-4">
        <SearchSample className="active:scale-95 transition-transform" />
        <FilterSample className="active:scale-95 transition-transform" />
      </div>
    </header>
  );
};
