import { Link } from "react-router-dom";
import { ChevronRight, DoorOpen } from "lucide-react";
import { TaskThumbnailCard } from "@/components/dashboard/TaskThumbnailCard";
import { Badge } from "@/components/ui/badge";
import { statusLabels } from "@/lib/repairLabels";
import type { RoomJobGroup } from "@/lib/propertyJobs";
import { cn } from "@/lib/utils";
import type { Repair } from "@/types/repair";

interface PropertyRoomJobsPanelProps {
  building: string;
  room: RoomJobGroup;
  className?: string;
}

function unitTypeLabel(type: RoomJobGroup["unitType"]) {
  if (type === "common") return "Common area";
  if (type === "utility") return "Utility";
  return "Room";
}

export function PropertyRoomJobsPanel({
  building,
  room,
  className,
}: PropertyRoomJobsPanelProps) {
  const hasJobs = room.jobs.length > 0;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[1.5rem] border border-primary/15 bg-gradient-to-br from-primary/[0.04] via-card to-card shadow-sm",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/70 px-5 py-5 sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/5",
              room.unitType === "room"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            <DoorOpen className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">{room.unitCode}</h2>
              <Badge variant="outline" className="rounded-md text-[10px] uppercase tracking-wide">
                {unitTypeLabel(room.unitType)}
              </Badge>
              {room.beds ? (
                <span className="text-xs text-muted-foreground">{room.beds} bed</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {room.activeCount > 0 ? (
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold tabular-nums text-amber-800 dark:text-amber-300">
              {room.activeCount} active
            </span>
          ) : null}
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold tabular-nums text-primary">
            {room.jobs.length} job{room.jobs.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="space-y-2.5 p-5 sm:p-6">
        {hasJobs ? (
          <>
            {room.jobs.map((job) => (
              <RoomJobRow key={job.id} job={job} />
            ))}
            <Link
              to={`/tasks?building=${encodeURIComponent(building)}&unit=${encodeURIComponent(room.unitCode)}`}
              className="inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-primary hover:underline"
            >
              View all in maintenance jobs
              <ChevronRight className="h-4 w-4" />
            </Link>
          </>
        ) : (
          <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
            No maintenance jobs logged for this room yet.
          </p>
        )}
      </div>
    </section>
  );
}

function RoomJobRow({ job }: { job: Repair }) {
  return (
    <TaskThumbnailCard
      repair={job}
      to={`/tasks/${job.id}`}
      hideImages
      compact
      footer={
        <>
          {statusLabels[job.status]}
          {job.assignedTo ? ` · ${job.assignedTo}` : " · Unassigned"}
        </>
      }
    />
  );
}
