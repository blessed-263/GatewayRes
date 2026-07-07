import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { daysOpen, formatDate } from "@/lib/utils";
import {
  categoryLabels,
  priorityBadgeVariant,
  priorityLabels,
  statusBadgeVariant,
  statusLabels,
} from "@/lib/repairLabels";
import { assignableMembers } from "@/data/teamMembers";
import { categoryIcons, categoryTileClass } from "@/lib/categoryVisuals";
import type { Repair, RepairStatus } from "@/types/repair";

interface RepairMobileCardsProps {
  repairs: Repair[];
  onStatusUpdate: (id: string, status: RepairStatus) => void;
  onAssign?: (id: string, assignedTo: string | undefined) => void;
  onSchedule?: (id: string, scheduledFor: string | undefined) => void;
}

export function RepairMobileCards({
  repairs,
  onStatusUpdate,
  onAssign,
  onSchedule,
}: RepairMobileCardsProps) {
  if (repairs.length === 0) {
    return (
      <p className="px-4 py-12 text-center text-sm text-muted-foreground">
        No repairs match your filters.
      </p>
    );
  }

  return (
    <div className="space-y-3 p-4 md:hidden">
      {repairs.map((repair) => {
        const CategoryIcon = categoryIcons[repair.category] ?? categoryIcons.other;
        const tileClass = categoryTileClass[repair.category] ?? categoryTileClass.other;
        return (
        <article
          key={repair.id}
          className="photo-card p-4"
        >
          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
            <Link
              to={`/tasks/${repair.id}`}
              className="font-mono text-xs font-bold text-primary underline-offset-2 hover:underline"
            >
              {repair.id}
            </Link>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant={priorityBadgeVariant(repair.priority)}>
                {priorityLabels[repair.priority]}
              </Badge>
              <Badge variant={statusBadgeVariant(repair.status)}>
                {statusLabels[repair.status]}
              </Badge>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tileClass}`}
            >
              <CategoryIcon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium leading-snug">{repair.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {repair.description}
              </p>
            </div>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
            <div>
              <dt className="text-muted-foreground">Unit</dt>
              <dd className="font-medium">
                {repair.unit} · {repair.building}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Category</dt>
              <dd className="font-medium">{categoryLabels[repair.category]}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Reported</dt>
              <dd className="font-medium">{formatDate(repair.reportedAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Open</dt>
              <dd className="font-medium">
                {repair.status === "completed"
                  ? "-"
                  : `${daysOpen(repair.reportedAt)} days`}
              </dd>
            </div>
          </dl>
          <div className="mt-4 space-y-3 border-t border-border/60 pt-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </label>
              <Select
                value={repair.status}
                onValueChange={(v) =>
                  onStatusUpdate(repair.id, v as RepairStatus)
                }
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "open",
                      "in_progress",
                      "awaiting_parts",
                      "completed",
                      "cancelled",
                    ] as RepairStatus[]
                  ).map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabels[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {onSchedule ? (
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Scheduled
                </label>
                <input
                  type="date"
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={repair.scheduledFor ?? ""}
                  onChange={(e) =>
                    onSchedule(repair.id, e.target.value || undefined)
                  }
                />
              </div>
            ) : null}
            {onAssign ? (
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Assigned to
                </label>
                <Select
                  value={repair.assignedTo ?? "Unassigned"}
                  onValueChange={(v) =>
                    onAssign(
                      repair.id,
                      v === "Unassigned" ? undefined : v
                    )
                  }
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                    {assignableMembers.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
        </article>
        );
      })}
    </div>
  );
}
