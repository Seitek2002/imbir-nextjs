import { colors } from "@/shared/config";

const PdfIcon = () => (
  <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
    <rect
      x="1"
      y="1"
      width="26"
      height="30"
      rx="3"
      stroke={colors.borderSoft}
      strokeWidth="1.5"
    />
    <text x="4" y="21" fontSize="8" fill={colors.primary} fontWeight="bold">
      PDF
    </text>
  </svg>
);

const DocIcon = () => (
  <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
    <rect
      x="1"
      y="1"
      width="26"
      height="30"
      rx="3"
      stroke={colors.borderSoft}
      strokeWidth="1.5"
    />
    <text x="3" y="21" fontSize="7.5" fill="#4B89DC" fontWeight="bold">
      DOC
    </text>
  </svg>
);

type Props = { file: File; onRemove: () => void };

export const FileThumb = ({ file, onRemove }: Props) => {
  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";

  return (
    <div className="relative flex flex-col items-center gap-1">
      <div className="relative size-16 rounded-lg overflow-hidden border border-border bg-background flex items-center justify-center">
        {isImage ? (
          <img
            src={URL.createObjectURL(file)}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : isPdf ? (
          <PdfIcon />
        ) : (
          <DocIcon />
        )}
        <button
          onClick={onRemove}
          className="absolute top-0 right-0 w-1/2 aspect-square bg-black/60 flex items-center justify-center text-white leading-none"
        >
          ×
        </button>
      </div>
      <span className="text-[10px] text-muted max-w-[64px] truncate">
        {file.name}
      </span>
    </div>
  );
};
