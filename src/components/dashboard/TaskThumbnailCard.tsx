import { format, parseISO } from "date-fns";
import { ChevronRight, Sparkles } from "lucide-react";
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

export function TaskThumbnailCard({
  repair,
  to,
  footer,
  compact = false,
  layout = "row",
  className,
  hideImages: _hideImages = true,
}: TaskThumbnailCardProps) {
  const CategoryIcon = categoryIcons[repair.category] ?? categoryIcons.other;
  const tileClass = categoryTileClass[repair.category] ?? categoryTileClass.other;
  const priorityTone =
    repair.priority === "urgent"
      ? "from-red-500/15 via-red-500/5 to-transparent"
      : repair.priority === "high"
        ? "from-amber-500/15 via-amber-500/5 to-transparent"
        : "from-primary/10 via-primary/5 to-transparent";

  if (layout === "tile") {
    return (
      <Link
        to={to}
        className={cn(
          "group flex flex-col gap-3 rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/25 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
          className
        )}
      >
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/5",
            tileClass
          )}
        >
          <CategoryIcon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {repair.title}
          </p>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {repair.unit}
            {repair.unit && " · "}
            {repair.building}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-2">
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
        "group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
        categoryBorderClass[repair.category] ?? categoryBorderClass.other,
        compact ? "gap-3 p-3" : "gap-4 p-4",
        className
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-r", priorityTone)} />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary/30 via-primary/80 to-primary/30" />
      <div
        className={cn(
          "relative z-10 flex shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1 ring-black/5",
          compact ? "h-12 w-12" : "h-16 w-16 sm:h-20 sm:w-20",
          tileClass
        )}
      >
        <CategoryIcon
          className={compact ? "h-5 w-5" : "h-6 w-6"}
          strokeWidth={1.75}
        />
      </div>

      <div className="relative z-10 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {repair.title}
          </p>
          {repair.priority === "urgent" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">
              <Sparkles className="h-3 w-3" />
              Urgent
            </span>
          ) : null}
        </div>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          {repair.unit} · {repair.building}
        </p>
        <p className="mt-1 truncate text-xs text-muted-foreground/90">
          Reported {format(parseISO(repair.reportedAt), "dd MMM yyyy")}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge
            variant={statusBadgeVariant(repair.status)}
            className="rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wide"
          >
            {statusLabels[repair.status]}
          </Badge>
          <Badge
            variant={priorityBadgeVariant(repair.priority)}
            className="rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wide"
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
      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
