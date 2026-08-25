import { FC } from "react";

import { Checkbox } from "@/shared/ui";

type CheckboxGroupProps = {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
};

// Тот же компонент, что уже используется у клиники (регистрация и кабинет,
// см. pages/register/clinic-form/CheckboxGroup.tsx и
// pages/clinic/clinic-profile/sections/equipment/ui.tsx) — здесь для кабинета
// врача, чтобы список оборудования/условий/оплаты выбирался из справочника
// бэка, а не терялся при опечатке в свободном тексте через запятую.
export const CheckboxGroup: FC<CheckboxGroupProps> = ({
  label,
  options,
  value,
  onChange,
}) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-overlay">{label}</span>
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-xs text-primary hover:underline"
        >
          Сбросить
        </button>
      )}
    </div>
    <div className="rounded-xl border border-border divide-y divide-border">
      {options.map((opt) => (
        <Checkbox
          key={opt}
          className="w-full px-4 py-3"
          label={opt}
          checked={value.includes(opt)}
          onChange={(e) =>
            onChange(
              e.target.checked
                ? [...value, opt]
                : value.filter((v) => v !== opt),
            )
          }
        />
      ))}
    </div>
  </div>
);

type FieldViewProps = {
  label: string;
  value: string | string[];
};

export const FieldView: FC<FieldViewProps> = ({ label, value }) => {
  const values = Array.isArray(value) ? value : [value];

  return (
    <div>
      {label && <p className="text-muted text-sm">{label}</p>}
      <div className="mt-0.5 space-y-0.5">
        {values.length === 0 || (values.length === 1 && !values[0]) ? (
          <p className="text-foreground font-medium text-base">—</p>
        ) : (
          values.map((v, i) => (
            <p key={i} className="text-foreground font-medium text-base">
              {v || "—"}
            </p>
          ))
        )}
      </div>
    </div>
  );
};

export const formStyles = {
  inp: "w-full px-4 py-3 rounded-2xl border border-border text-foreground placeholder:text-dim focus:outline-none focus:border-primary transition-colors bg-white",
  lbl: "block text-muted text-sm mb-1.5",
  // Раскладка полей раздела «Мои данные». По макету на мобильном это список
  // с тонкими разделителями, на десктопе — сетка в две колонки.
  fieldList:
    "divide-y divide-background lg:divide-y-0 lg:grid lg:grid-cols-2 lg:gap-5 [&>div]:py-3 [&>div:first-child]:pt-0 [&>div:last-child]:pb-0 lg:[&>div]:py-0",
  // Та же сетка в режиме редактирования: поля-инпуты идут с отступами,
  // без разделителей.
  formGrid: "flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-5",
} as const;
