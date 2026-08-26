import { Checkbox } from "@/shared/ui";

type Props = {
  label: string;
  onChange: (v: string[]) => void;
  options: string[];
  value: string[];
};

export const CheckboxGroup = ({ label, options, value, onChange }: Props) => (
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
