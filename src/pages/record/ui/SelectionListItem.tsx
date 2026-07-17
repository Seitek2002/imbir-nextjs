import { GeoIcon, StarIcon } from "@/shared/assets/icons";
import { cn } from "@/shared/lib/utils";
import { ImageWithFallback } from "@/shared/ui";

import { formatPrice } from "../model/lib";
import type { Clinic, SelectionItem } from "../model/types";

export const SelectionListItem = ({
  item,
  clinicMap,
  selected,
  compact = false,
  onSelect,
}: {
  item: SelectionItem;
  clinicMap: Map<string, Clinic>;
  selected: boolean;
  compact?: boolean;
  onSelect: () => void;
}) => {
  const isClinic = "address" in item;
  const isDoctor = "specialty" in item;
  const isService = "category" in item;
  const itemTitle = isService ? item.title : item.name;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full border rounded-2xl flex items-start transition-colors",
        compact ? "p-2 gap-2" : "p-2.5 gap-2.5",
        selected
          ? "border-primary bg-primary-tint"
          : "border-border-soft hover:border-primary/40",
      )}
    >
      <div
        className={cn(
          "relative rounded-xl overflow-hidden bg-background shrink-0",
          compact ? "size-16" : "size-20",
        )}
      >
        <ImageWithFallback
          src={item.image}
          alt={itemTitle}
          fill
          sizes="80px"
          className="object-cover"
          fallback={null}
        />
      </div>

      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "font-medium text-foreground leading-snug truncate",
              compact ? "text-base" : "text-[26px]",
            )}
          >
            {itemTitle}
          </p>
          {isService && (
            <span
              className={cn(
                "font-semibold text-foreground leading-none shrink-0",
                compact ? "text-base" : "text-[24px]",
              )}
            >
              {formatPrice(item.price)}
            </span>
          )}
        </div>

        {isDoctor && (
          <p
            className={cn(
              "text-secondary mt-1",
              compact ? "text-xs" : "text-sm",
            )}
          >
            {item.specialty}
            <span className="text-primary">
              {" "}
              • {clinicMap.get(item.clinicId)?.name}
            </span>
          </p>
        )}

        {isService && (
          <p
            className={cn(
              "text-secondary mt-1",
              compact ? "text-xs" : "text-sm",
            )}
          >
            {item.category}
            <span className="text-primary">
              {" "}
              • {clinicMap.get(item.clinicId)?.name}
            </span>
          </p>
        )}

        <div
          className={cn(
            "flex items-center gap-1 mt-1 text-secondary",
            compact ? "text-xs" : "text-sm",
          )}
        >
          <StarIcon className="size-4 text-primary" />
          <span className="font-medium text-primary">{item.rating}</span>
          <span>({item.reviews})</span>
          {(isClinic || isDoctor) && item.experience > 0 && (
            <span>• {item.experience} лет опыта</span>
          )}
        </div>

        {isClinic && (
          <div
            className={cn(
              "flex items-center gap-1 mt-1 text-secondary",
              compact ? "text-xs" : "text-sm",
            )}
          >
            <GeoIcon className="size-4 text-primary" />
            <span className="truncate">{item.address}</span>
          </div>
        )}
      </div>

      <span className="size-6 rounded-full border shrink-0 mt-1 border-[#D4D8DB] flex items-center justify-center">
        {selected && <span className="size-3.5 rounded-full bg-primary" />}
      </span>
    </button>
  );
};
