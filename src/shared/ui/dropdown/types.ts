export type Option = {
  label: string;
  value: string;
};

export type DropdownType = 'default' | 'checkbox' | 'radio';

export type DropdownProps = {
  label?: string;
  placeholder?: string;
  hint?: string;
  options: Option[];
  type?: DropdownType;
  isMulti?: boolean;
  searchable?: boolean;
  value?: any; // string | string[]
  onChange?: (value: any) => void;
  className?: string;
};
