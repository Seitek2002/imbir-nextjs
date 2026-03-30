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
      <div className="bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[#191A1B] text-lg font-medium">Недавно искали</h2>
          <span className="text-[#F5653E] text-base">Удалить все</span>
        </div>
        <ul className="flex flex-col gap-4">
          <li>Первичная медико-санитарная помощь</li>
          <li>Врач по зубам</li>
          <li>Жалобы на боль</li>
          <li>Врачи-специалисты по глазам</li>
          <li>Доктор Айбеков Н. Э</li>
        </ul>
      </div>
      <div className="p-4 bg-white">
        <h2 className="text-[#191A1B] text-lg font-medium mb-3">Категории</h2>
        <div className="grid grid-cols-2 gap-x-3.5 gap-y-3 text-[#191A1B] font-medium">
          <div className="border border-[#E3E4E5] px-3 py-4 line-clamp-1 rounded-2xl">
            Кардиология
          </div>
          <div className="border border-[#E3E4E5] px-3 py-4 line-clamp-1 rounded-2xl">
            Нефрология
          </div>
          <div className="border border-[#E3E4E5] px-3 py-4 line-clamp-1 rounded-2xl">
            Пульмонология
          </div>
          <div className="border border-[#E3E4E5] px-3 py-4 line-clamp-1 rounded-2xl">
            Гастроэнтерология
          </div>
          <div className="border border-[#E3E4E5] px-3 py-4 line-clamp-1 rounded-2xl">
            Офтальмология
          </div>
          <div className="border border-[#E3E4E5] px-3 py-4 line-clamp-1 rounded-2xl">
            Неврология
          </div>
          <div className="border border-[#E3E4E5] px-3 py-4 line-clamp-1 rounded-2xl">
            Стоматология
          </div>
          <div className="border border-[#E3E4E5] px-3 py-4 line-clamp-1 rounded-2xl">
            Дерматология
          </div>
        </div>
      </div>
    </main>
  );
};

export default SearchPage;
