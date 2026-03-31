import { FC } from "react";

import { FiltersTrigger, MobileFiltersModal, SearchInput } from "@/features";
import { Header } from "@/widgets";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export const SpecialistsPage: FC<Props> = ({ searchParams }) => {
  const query =
    typeof searchParams?.search === "string" ? searchParams.search : "";

  console.log(query);

  const isFiltersModalOpen = searchParams?.modal === "filters";

  return (
    <div>
      <Header title="Специалисты" backTo="/">
        <div className="flex gap-3 items-center mt-3">
          <div className="flex-1">
            <SearchInput placeholder="Поиск специалиста" />
          </div>
          <FiltersTrigger />
        </div>
      </Header>

      <MobileFiltersModal
        isOpen={isFiltersModalOpen}
        fields={{ specialty: true, experience: true, rating: true }}
      />

      {/* Тут будет список врачей */}
    </div>
  );
};
