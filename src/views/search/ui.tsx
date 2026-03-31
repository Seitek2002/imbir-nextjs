import { FC } from "react";

import { SearchInput } from "@/features";

import { CategoriesGrid } from "@/widgets/categories-grid/ui";
import { Header } from "@/widgets/header";
import { RecentSearches } from "@/widgets/recent-searches/ui";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export const SearchPage: FC<Props> = ({ searchParams }) => {
  const query =
    typeof searchParams?.search === "string" ? searchParams.search : "";

  return (
    <main className="min-h-screen bg-[#F2F3F5]">
      <Header title="Поиск" backTo="/">
        <SearchInput />
      </Header>

      {query ? (
        <div className="p-4">
          <h2 className="text-[#191A1B] text-lg font-medium mb-3">
            Результаты по запросу: {query}
          </h2>
          {/* Сюда позже вставишь виджет со списком врачей */}
        </div>
      ) : (
        <>
          <RecentSearches />
          <CategoriesGrid />
        </>
      )}
    </main>
  );
};
