export type Option = {
  label: string;
  value: string;
};

export type DropdownType = "default" | "checkbox" | "radio";

// Общие пропсы, которые есть всегда
type BaseDropdownProps = {
  label?: string;
  placeholder?: string;
  hint?: string;
  options: Option[];
  type?: DropdownType;
  searchable?: boolean;
  className?: string;
};

// Пропсы для обычного выпадающего списка (isMulti === false или не передан)
export type SingleDropdownProps = BaseDropdownProps & {
  isMulti?: false;
  value?: string;
  onChange?: (value: string) => void;
};

// Пропсы для списка с множественным выбором (isMulti === true)
export type MultiDropdownProps = BaseDropdownProps & {
  isMulti: true;
  value?: string[];
  onChange?: (value: string[]) => void;
};

// Объединяем их
export type DropdownProps = SingleDropdownProps | MultiDropdownProps;
