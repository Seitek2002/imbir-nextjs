import { FC } from "react";

type Props = { title: string };

export const CategoryCard: FC<Props> = ({ title }) => {
  return (
    <div className="border border-[#E3E4E5] px-3 py-4 line-clamp-1 rounded-2xl">
      {title}
    </div>
  );
};
