import { DocumentTextIcon } from "@/shared/assets/icons";

// У статьи может не быть обложки — вместо голого фона или зависшего навечно
// skeleton показываем иконку в мягком фирменном фоне.
export const BlogImageFallback = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-primary-tint">
    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/70">
      <DocumentTextIcon className="size-5 text-primary" />
    </div>
  </div>
);
