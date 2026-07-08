import { Link } from "react-router-dom";
import { categoryBarClass } from "@/lib/categoryVisuals";
import { cn } from "@/lib/utils";
import type { RepairCategory } from "@/types/repair";

interface TeamSectionHeaderProps {
  category: RepairCategory;
  label: string;
  description: string;
  memberCount: number;
  totalActive: number;
  availableCount: number;
  tasksLink?: string;
}

export function TeamSectionHeader({
  category,
  label,
  description,
  memberCount,
  totalActive,
  availableCount,
  tasksLink,
}: TeamSectionHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 gap-4">
        <div
          className={cn(
            "w-1.5 shrink-0 self-stretch rounded-full",
            categoryBarClass[category] ?? categoryBarClass.other
          )}
        />
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight">{label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <span className="font-medium text-foreground">
              {memberCount} worker{memberCount === 1 ? "" : "s"}
            </span>
            <span className="text-muted-foreground">
              <span className="font-semibold tabular-nums text-foreground">{totalActive}</span> active
              jobs
            </span>
            <span className="text-muted-foreground">
              <span className="font-semibold tabular-nums text-emerald-600">{availableCount}</span>{" "}
              available
            </span>
          </div>
        </div>
      </div>
      {tasksLink ? (
        <Link
          to={tasksLink}
          className="shrink-0 text-sm font-semibold text-primary hover:underline"
        >
          View jobs →
        </Link>
      ) : null}
    </div>
  );
}
