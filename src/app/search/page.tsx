import { FC } from "react";

import { Input } from "@/shared";
import { Header } from "@/widgets";

import { SearchIcon } from "@/shared/assets";

const SearchPage: FC = () => {
  return (
    <main>
      <Header title="Поиск">
        <Input
          IconLeft={SearchIcon}
          placeholder="Поиск клиники, врача, услуги"
          className="w-full rounded-full"
          labelClassName="mt-3"
        />
      </Header>
    </main>
  );
};

export default SearchPage;
