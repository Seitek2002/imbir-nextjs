import { FC } from "react";

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
} as const;
