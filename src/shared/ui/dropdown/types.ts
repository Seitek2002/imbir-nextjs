export type Option = {
  label: string;
  value: string;
};

export type DropdownType = "checkbox" | "default" | "radio";

// Общие пропсы, которые есть всегда
type BaseDropdownProps = {
  className?: string;
  hint?: string;
  label?: string;
  options: Option[];
  placeholder?: string;
  searchable?: boolean;
  /**
   * Что делает пункт «Все». Смысл разный в фильтре и в форме, а перепутать
   * их дорого: в форме «очистить» означало бы потерю всего выбранного.
   *
   * "clear"  — снять выбор (фильтр: «Все» = без ограничения, в API не уходит
   *            огромный список). Значение по умолчанию.
   * "select" — отметить все пункты, повторный клик — снять (форма: «Все» значит,
   *            что клиника действительно работает по всем направлениям).
   */
  selectAllMode?: "clear" | "select";
  showSelectAll?: boolean;
  type?: DropdownType;
};

// Пропсы для обычного выпадающего списка (isMulti === false или не передан)
export type SingleDropdownProps = BaseDropdownProps & {
  isMulti?: false;
  onChange?: (value: string) => void;
  value?: string;
};

// Пропсы для списка с множественным выбором (isMulti === true)
export type MultiDropdownProps = BaseDropdownProps & {
  isMulti: true;
  onChange?: (value: string[]) => void;
  value?: string[];
};

// Объединяем их
export type DropdownProps = MultiDropdownProps | SingleDropdownProps;
