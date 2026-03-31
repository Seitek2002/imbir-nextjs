import { FC } from "react";

import { SearchInput } from "@/features";
import { Header } from "@/widgets";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export const SpecialistsPage: FC<Props> = ({ searchParams }) => {
  const query =
    typeof searchParams?.search === "string" ? searchParams.search : "";

  console.log(query);

  return (
    <div>
      <Header title="Специалисты">
        <SearchInput />
      </Header>
    </div>
  );
};
