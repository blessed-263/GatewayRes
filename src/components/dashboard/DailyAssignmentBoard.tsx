import {
  addDays,
  format,
  isToday,
  parseISO,
} from "date-fns";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExportButtons } from "@/components/dashboard/ExportButtons";
import { assignableMembers } from "@/data/teamMembers";
import {
  categoryLabels,
  priorityBadgeVariant,
  priorityLabels,
  statusBadgeVariant,
  statusLabels,
} from "@/lib/repairLabels";
import { getRepairsForDay, todayKey } from "@/lib/export";
import { cn } from "@/lib/utils";
import { useRepairs } from "@/context/RepairsContext";
import type { Repair, RepairStatus } from "@/types/repair";

function AssignmentRow({
  repair,
  onAssign,
  onSchedule,
  onStatusUpdate,
}: {
  repair: Repair;
  onAssign: (id: string, who: string | undefined) => void;
  onSchedule: (id: string, date: string | undefined) => void;
  onStatusUpdate: (id: string, status: RepairStatus) => void;
}) {
  return (
    <div className="grid gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm shadow-black/[0.02] lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            {repair.id}
          </span>
          <Badge variant={priorityBadgeVariant(repair.priority)}>
            {priorityLabels[repair.priority]}
          </Badge>
          <Badge variant={statusBadgeVariant(repair.status)}>
            {statusLabels[repair.status]}
          </Badge>
        </div>
        <p className="mt-2 text-lg font-semibold leading-snug">{repair.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {repair.unit} · {repair.building} · {categoryLabels[repair.category]}
        </p>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Assignee
        </p>
        <Select
          value={repair.assignedTo ?? "Unassigned"}
          onValueChange={(v) =>
            onAssign(repair.id, v === "Unassigned" ? undefined : v)
          }
        >
          <SelectTrigger className="h-11 w-full min-w-[180px]">
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
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Status
        </p>
        <Select
          value={repair.status}
          onValueChange={(v) => onStatusUpdate(repair.id, v as RepairStatus)}
        >
          <SelectTrigger className="h-11 w-full min-w-[160px]">
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
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Schedule
        </p>
        <input
          type="date"
          className="flex h-11 w-full min-w-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={repair.scheduledFor ?? ""}
          onChange={(e) =>
            onSchedule(repair.id, e.target.value || undefined)
          }
        />
      </div>
    </div>
  );
}

interface DailyAssignmentBoardProps {
  initialDate?: string;
}

export function DailyAssignmentBoard({
  initialDate,
}: DailyAssignmentBoardProps = {}) {
  const { repairs, assignRepair, scheduleRepair, updateRepairStatus } =
    useRepairs();
  const [selectedDay, setSelectedDay] = useState(initialDate ?? todayKey());

  const scheduledToday = useMemo(
    () => getRepairsForDay(repairs, selectedDay),
    [repairs, selectedDay]
  );

  const unscheduledActive = useMemo(
    () =>
      repairs.filter(
        (r) =>
          !r.scheduledFor &&
          r.status !== "completed" &&
          r.status !== "cancelled"
      ),
    [repairs]
  );

  const byAssignee = useMemo(() => {
    const map: Record<string, Repair[]> = {};
    for (const r of scheduledToday) {
      const key = r.assignedTo ?? "Unassigned";
      if (!map[key]) map[key] = [];
      map[key].push(r);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [scheduledToday]);

  function shiftDay(offset: number) {
    const base = parseISO(`${selectedDay}T12:00:00`);
    setSelectedDay(format(addDays(base, offset), "yyyy-MM-dd"));
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm shadow-black/[0.03] sm:p-6 lg:p-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Daily command board
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Plan the day, assign owners, export the run sheet
            </h2>
          </div>
          <div className="flex w-full flex-col gap-3 xl:w-auto xl:items-end">
            <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-2 rounded-2xl border border-border/70 bg-muted/25 p-2 sm:w-auto sm:min-w-[460px]">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl px-4"
                onClick={() => shiftDay(-1)}
              >
                Prev
              </Button>
              <div
                className={cn(
                  "min-w-0 rounded-xl px-4 py-2 text-center",
                  isToday(parseISO(`${selectedDay}T12:00:00`))
                    ? "bg-primary text-primary-foreground"
                    : "bg-card"
                )}
              >
                <p className="font-heading text-base font-semibold sm:text-lg">
                  {format(parseISO(`${selectedDay}T12:00:00`), "EEE d MMM yyyy")}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl px-4"
                onClick={() => shiftDay(1)}
              >
                Next
              </Button>
            </div>
            <div className="flex flex-wrap justify-start gap-2 xl:justify-end">
              <Button
                type="button"
                variant="ghost"
                className="h-11 rounded-xl px-4 font-semibold"
                onClick={() => setSelectedDay(todayKey())}
              >
                Jump to today
              </Button>
              <ExportButtons
                repairs={repairs}
                dailyDate={selectedDay}
                exportLabel={selectedDay}
                className="gap-2"
                buttonClassName="h-11 rounded-xl px-4 font-semibold"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl font-semibold">
              {scheduledToday.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Assignees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl font-semibold">
              {byAssignee.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Unscheduled backlog
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl font-semibold">
              {unscheduledActive.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {byAssignee.length > 0 ? (
        <div className="space-y-6">
          {byAssignee.map(([assignee, tasks]) => (
            <section key={assignee} className="rounded-[1.5rem] border border-border/70 bg-card p-5">
              <h3 className="mb-4 flex items-center gap-3 font-heading text-base font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-sm font-bold text-primary">
                  {assignee
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                {assignee}
                <span className="font-normal normal-case text-muted-foreground">
                  ({tasks.length} job{tasks.length === 1 ? "" : "s"})
                </span>
              </h3>
              <div className="space-y-3">
                {tasks.map((repair) => (
                  <AssignmentRow
                    key={repair.id}
                    repair={repair}
                    onAssign={assignRepair}
                    onSchedule={scheduleRepair}
                    onStatusUpdate={updateRepairStatus}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Card className="border-border/60">
          <CardContent className="py-14 text-center text-base text-muted-foreground">
            No maintenance jobs scheduled for this day. Assign backlog items below or pick a
            date on each job.
          </CardContent>
        </Card>
      )}

      <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 sm:p-6">
        <h2 className="mb-3 font-heading text-2xl font-semibold tracking-tight">
          Schedule backlog
        </h2>
        <p className="mb-5 max-w-2xl text-base leading-7 text-muted-foreground">
          Active repairs not yet on the calendar. Set a date to add them to a
          daily run.
        </p>
        {unscheduledActive.length === 0 ? (
          <p className="text-base text-muted-foreground">No unscheduled maintenance jobs.</p>
        ) : (
          <div className="space-y-3">
            {unscheduledActive.map((repair) => (
              <AssignmentRow
                key={repair.id}
                repair={repair}
                onAssign={assignRepair}
                onSchedule={scheduleRepair}
                onStatusUpdate={updateRepairStatus}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
