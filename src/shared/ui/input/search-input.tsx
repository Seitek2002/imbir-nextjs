"use client";

import { ChangeEvent, FC } from "react";

// Импортируем иконку крестика (RemoveIcon)
import { RemoveIcon, SearchIcon } from "@/shared/assets/icons";
import { Input } from "@/shared/ui";

type Props = {
  onChange: (val: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  value: string;
};

export const SearchInput: FC<Props> = ({
  placeholder = "Поиск",
  value,
  onChange,
  onEnter,
}) => {
  // Функция очистки инпута
  const handleClear = () => {
    onChange("");
  };

  return (
    <Input
      IconLeft={SearchIcon}
      // Если текст есть (value не пустое), передаем иконку крестика, иначе undefined (скрываем)
      IconRight={value ? RemoveIcon : undefined}
      // Передаем функцию очистки. Название пропса может отличаться в твоем компоненте Input!
      onIconRightClick={handleClear}
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
