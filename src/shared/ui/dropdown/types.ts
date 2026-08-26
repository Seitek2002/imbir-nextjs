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
