import { FC } from "react";

import { FiltersTrigger, MobileFiltersModal, UrlSearchInput } from "@/features";
import { Header } from "@/widgets";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export const SpecialistsPage: FC<Props> = ({ searchParams }) => {
  const query = typeof searchParams?.q === "string" ? searchParams.q : "";

  console.log("Текущий запрос:", query);

  const isFiltersModalOpen = searchParams?.modal === "filters";

  return (
    <div>
      <Header title="Специалисты" backTo="/">
        <div className="flex gap-3 items-center mt-3">
          <div className="flex-1">
            <UrlSearchInput placeholder="Поиск специалиста" />
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
