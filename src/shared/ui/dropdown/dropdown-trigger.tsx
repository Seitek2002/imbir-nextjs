import { FC } from "react";

import { DropdownArrowIcon, DropdownRemoveIcon } from "@/shared/assets/icons";
import { cn } from "@/shared/lib/utils";

import { Option } from "./types";

type TriggerProps = {
  isActive: boolean;
  isMulti: boolean;
  onClearAll: () => void;
  onRemove: (val: string) => void;
  onToggle: () => void;
  options: Option[];
  placeholder: string;
  value?: string | string[];
};

// Сколько чипов показываем в триггере, остальные сворачиваем в «+N».
// Без этого предела выбор «Все» в специализациях (их ~40) растягивал контрол
// на сотню строк: чипы лежат во flex-wrap, высота ничем не ограничена, и
// выпадающее меню (absolute top-full) уезжало далеко вниз за пределы экрана.
const MAX_VISIBLE_CHIPS = 2;

const Chip: FC<{ onDelete: () => void; text: string }> = ({
  text,
  onDelete,
}) => (
  <span className="flex items-center gap-1 max-w-full px-2 py-0.5 border border-border-soft rounded-md bg-white text-sm">
    <span className="truncate">{text}</span>
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="shrink-0 hover:text-primary transition-colors"
    >
      <DropdownRemoveIcon className="size-3.5" />
    </button>
  </span>
);

export const DropdownTrigger: FC<TriggerProps> = ({
  isActive,
  isMulti,
  value,
  options,
  placeholder,
  onToggle,
  onRemove,
  onClearAll,
}) => {
  const selected = isMulti && Array.isArray(value) ? value : [];
  // Выбрано всё — показываем это одним чипом «Все», а не сорока штуками.
  const allSelected = options.length > 0 && selected.length === options.length;
  const visible = allSelected ? [] : selected.slice(0, MAX_VISIBLE_CHIPS);
  const hiddenCount = selected.length - visible.length;

  const labelOf = (val: string) =>
    options.find((o) => o.value === val)?.label ?? val;

  return (
    // Триггер — div, а не button: внутри лежат чипы с собственными кнопками
    // удаления, а кнопка в кнопке невалидна. Поэтому клавиатурное поведение
    // добавляем руками: без него Tab пропускал дропдаун целиком, и форму с
    // обязательным полем-списком (например «Город» в анкете врача) нельзя
    // было заполнить без мыши.
    <div
      // role="button", а не "combobox": у combobox обязателен aria-controls с
      // id списка, а список рендерится отдельным компонентом. Для триггера,
      // раскрывающего меню, роли кнопки достаточно.
      role="button"
      tabIndex={0}
      aria-expanded={isActive}
      aria-haspopup="listbox"
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          // Пробел на непрокручиваемом элементе иначе листает страницу.
          e.preventDefault();
          onToggle();
        } else if (e.key === "Escape" && isActive) {
          onToggle();
        }
      }}
      className={cn(
        "flex items-center justify-between min-h-10.5 p-3 border rounded-lg cursor-pointer transition-all duration-200 bg-white select-none",
        "border-border-soft outline-none",
        // Кольцо фокуса — то же, что у Input и Button в проекте.
        "focus-visible:border-primary focus-visible:shadow-[0_0_1px_3px_rgba(245,101,62,0.45)]",
        isActive
          ? "border-primary shadow-[0_0_1px_3px_rgba(245,101,62,0.3)]"
          : "hover:border-primary/50",
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
        {selected.length > 0 ? (
          allSelected ? (
            <Chip text="Все" onDelete={onClearAll} />
          ) : (
            <>
              {visible.map((val) => (
                <Chip
                  key={val}
                  text={labelOf(val)}
                  onDelete={() => onRemove(val)}
                />
              ))}
              {hiddenCount > 0 && (
                <span className="shrink-0 px-2 py-0.5 rounded-md bg-background text-sm text-secondary">
                  +{hiddenCount}
                </span>
              )}
            </>
          )
        ) : (
          <span
            className={cn("truncate", value ? "text-foreground" : "text-muted")}
          >
            {/* Для не-multi мы уверены, что value это строка (или undefined) */}
            {options.find((o) => o.value === (value as string))?.label ||
              placeholder}
          </span>
        )}
      </div>
      <DropdownArrowIcon
        className={cn(
          "text-muted transition-transform duration-300 size-5",
          isActive && "rotate-180",
        )}
      />
    </div>
  );
};
