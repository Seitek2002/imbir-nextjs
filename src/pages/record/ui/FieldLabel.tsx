export const FieldLabel = ({
  label,
  hint,
}: {
  hint?: string;
  label: string;
}) => (
  <div className="flex items-center justify-between gap-3 mb-1.5">
    <span className="text-overlay text-sm font-medium">{label}</span>
    {hint && <span className="text-xs text-muted">{hint}</span>}
  </div>
);
