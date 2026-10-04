"use client";

import { FC, useState } from "react";

import dynamic from "next/dynamic";

import { SearchIcon } from "@/shared/assets/icons";
import { IconBtn } from "@/shared/ui";

// Кнопка-лупа стоит в шапке каждой страницы, а панель поиска (подсказки,
// история, плитки категорий со своими картинками) нужна только после клика —
// и только на десктопе: на телефоне шапка ведёт на /search. Поэтому панель
// живёт отдельным чанком и грузится по первому открытию, а не приезжает
// в общем бандле на каждую страницу.
const loadPanel = () => import("./panel").then((mod) => mod.GlobalSearchPanel);
const GlobalSearchPanel = dynamic(loadPanel, { ssr: false });

export const GlobalSearch: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <IconBtn
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        // Курсор над кнопкой — чанк начинает грузиться заранее, и к моменту
        // клика панель открывается без задержки.
        onPointerEnter={() => void loadPanel()}
        onFocus={() => void loadPanel()}
      >
        <SearchIcon className="size-5" />
      </IconBtn>

      {isOpen && <GlobalSearchPanel onClose={() => setIsOpen(false)} />}
    </>
  );
};
