"use client";

import { ChangeEvent, FC } from "react";

import { Input } from "@/shared";

import { SearchIcon } from "@/shared/assets";

type Props = {
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  onEnter?: () => void;
};

export const SearchInput: FC<Props> = ({
  placeholder = "Поиск",
  value,
  onChange,
  onEnter,
}) => {
  return (
    <Input
      IconLeft={SearchIcon}
      placeholder={placeholder || "Поиск клиники, врача, услуги"}
      className="w-full rounded-full bg-white"
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onEnter) {
          onEnter();
        }
      }}
    />
  );
};
