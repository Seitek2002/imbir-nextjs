import { Checkbox } from "@/shared/ui";

type Props = {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
};

export const CheckboxGroup = ({ label, options, value, onChange }: Props) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-sm font-medium text-overlay">{label}</span>
    <div className="rounded-xl border border-border divide-y divide-border">
      {options.map((opt) => (
        <div key={opt} className="px-4 py-3">
          <Checkbox
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
        </div>
      ))}
    </div>
  </div>
);
