import { FC } from "react";

type FieldViewProps = {
  label: string;
  value: string | string[];
};

export const FieldView: FC<FieldViewProps> = ({ label, value }) => {
  const values = Array.isArray(value) ? value : [value];

  return (
    <div>
      {label && <p className="text-[#838A8D] text-sm">{label}</p>}
      <div className="mt-0.5 space-y-0.5">
        {values.length === 0 || (values.length === 1 && !values[0]) ? (
          <p className="text-[#191A1B] font-medium text-base">—</p>
        ) : (
          values.map((v, i) => (
            <p key={i} className="text-[#191A1B] font-medium text-base">
              {v || "—"}
            </p>
          ))
        )}
      </div>
    </div>
  );
};

export const formStyles = {
  inp: "w-full px-4 py-3 rounded-2xl border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] transition-colors bg-white",
  lbl: "block text-[#838A8D] text-sm mb-1.5",
} as const;
