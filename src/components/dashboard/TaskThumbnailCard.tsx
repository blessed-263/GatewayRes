import { format, parseISO } from "date-fns";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { categoryIcons, categoryBorderClass, categoryTileClass } from "@/lib/categoryVisuals";
import {
  priorityBadgeVariant,
  priorityLabels,
  statusBadgeVariant,
  statusLabels,
} from "@/lib/repairLabels";
import { cn } from "@/lib/utils";
import type { Repair } from "@/types/repair";

interface TaskThumbnailCardProps {
  repair: Repair;
  to: string;
  /** Overrides the default "assignedTo · date" footer line */
  footer?: React.ReactNode;
  compact?: boolean;
  /** "row" (default) is a horizontal list item; "tile" is a compact stacked card for dense grids. */
  layout?: "row" | "tile";
  className?: string;
  hideImages?: boolean;
}

function thumbnailUrl(repair: Repair) {
  const photo = repair.attachments?.find(
    (a) => a.kind !== "invoice" && a.mimeType?.startsWith("image/")
  );
  return photo?.url;
}

export function TaskThumbnailCard({
  repair,
  to,
  footer,
  compact = false,
  layout = "row",
  className,
  hideImages = false,
}: TaskThumbnailCardProps) {
  const photo = hideImages ? undefined : thumbnailUrl(repair);
  const CategoryIcon = categoryIcons[repair.category] ?? categoryIcons.other;
  const tileClass = categoryTileClass[repair.category] ?? categoryTileClass.other;

  if (layout === "tile") {
    return (
      <Link to={to} className={cn("photo-card flex flex-col gap-3 p-4", className)}>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            !photo && tileClass
          )}
        >
          {photo ? (
            <img
              src={photo}
              alt=""
              className="h-full w-full rounded-xl object-cover"
              loading="lazy"
            />
          ) : (
            <CategoryIcon className="h-5 w-5" strokeWidth={1.75} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold leading-snug text-foreground">
            {repair.title}
          </p>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {repair.unit}
            {repair.unit && " · "}
            {repair.building}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant={statusBadgeVariant(repair.status)}
            className="px-2.5 py-0.5 text-[11px]"
          >
            {statusLabels[repair.status]}
          </Badge>
          <Badge
            variant={priorityBadgeVariant(repair.priority)}
            className="px-2.5 py-0.5 text-[11px]"
          >
            {priorityLabels[repair.priority]}
          </Badge>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className={cn(
        "photo-card flex items-center gap-3 border-l-4 p-3",
        categoryBorderClass[repair.category] ?? categoryBorderClass.other,
        compact ? "gap-3 p-3" : "gap-4 p-4",
        className
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-xl",
          compact ? "h-12 w-12" : "h-16 w-16 sm:h-20 sm:w-20",
          !photo && tileClass
        )}
      >
        {photo ? (
          <img
            src={photo}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <CategoryIcon
            className={compact ? "h-5 w-5" : "h-6 w-6"}
            strokeWidth={1.75}
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold leading-snug text-foreground">
          {repair.title}
        </p>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          {repair.unit} · {repair.building}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge
            variant={statusBadgeVariant(repair.status)}
            className="px-2.5 py-0.5 text-[11px]"
          >
            {statusLabels[repair.status]}
          </Badge>
          <Badge
            variant={priorityBadgeVariant(repair.priority)}
            className="px-2.5 py-0.5 text-[11px]"
          >
            {priorityLabels[repair.priority]}
          </Badge>
        </div>
        {!compact && (
          <p className="mt-2 truncate text-sm text-muted-foreground">
            {footer ?? (
              <>
                {repair.assignedTo ?? "Unassigned"} ·{" "}
                {format(parseISO(repair.reportedAt), "dd MMM")}
              </>
            )}
          </p>
        )}
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
