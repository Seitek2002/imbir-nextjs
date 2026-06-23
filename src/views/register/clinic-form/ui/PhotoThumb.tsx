type Props = { file: File; onRemove: () => void };

export const PhotoThumb = ({ file, onRemove }: Props) => (
  <div className="relative flex flex-col items-center gap-1">
    <div className="relative size-16 rounded-lg overflow-hidden border border-border bg-background">
      {file.type.startsWith("image/") ? (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[10px] text-muted font-bold">
          FILE
        </div>
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
