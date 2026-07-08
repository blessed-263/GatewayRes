import { useMemo, useState } from "react";
import {
  addDays,
  format,
  isToday,
  parseISO,
} from "date-fns";
import { GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExportButtons } from "@/components/dashboard/ExportButtons";
import { SlaBadge } from "@/components/operations/SlaBadge";
import { assignableMembers } from "@/data/teamMembers";
import { todayKey, getRepairsForDay } from "@/lib/export";
import {
  categoryLabels,
  priorityBadgeVariant,
  priorityLabels,
  statusBadgeVariant,
  statusLabels,
} from "@/lib/repairLabels";
import { cn } from "@/lib/utils";
import { useRepairs } from "@/context/RepairsContext";
import type { Repair } from "@/types/repair";

const columns = ["Unassigned", ...assignableMembers];

function TaskChip({
  repair,
  onDragStart,
}: {
  repair: Repair;
  onDragStart: (e: React.DragEvent, id: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, repair.id)}
      className="cursor-grab rounded-xl border border-border/70 bg-background p-3 shadow-sm active:cursor-grabbing"
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] text-muted-foreground">{repair.id}</span>
            <Badge variant={priorityBadgeVariant(repair.priority)} className="text-[10px]">
              {priorityLabels[repair.priority]}
            </Badge>
          </div>
          <p className="mt-1 text-sm font-semibold leading-snug">{repair.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {repair.unit} · {repair.building}
          </p>
          <div className="mt-2">
            <SlaBadge repair={repair} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DragDropPlanningBoard() {
  const { repairs, assignRepair, scheduleRepair } = useRepairs();
  const [selectedDay, setSelectedDay] = useState(todayKey());
  const [dragId, setDragId] = useState<string | null>(null);

  const activeRepairs = useMemo(
    () => repairs.filter((r) => r.status !== "completed" && r.status !== "cancelled"),
    [repairs]
  );

  const scheduledToday = useMemo(
    () => getRepairsForDay(activeRepairs, selectedDay),
    [activeRepairs, selectedDay]
  );

  const backlog = useMemo(
    () =>
      activeRepairs.filter(
        (r) => !r.scheduledFor || r.scheduledFor !== selectedDay
      ),
    [activeRepairs, selectedDay]
  );

  const byColumn = useMemo(() => {
    const map: Record<string, Repair[]> = {};
    for (const col of columns) map[col] = [];
    for (const repair of scheduledToday) {
      const key = repair.assignedTo ?? "Unassigned";
      if (!map[key]) map[key] = [];
      map[key].push(repair);
    }
    return map;
  }, [scheduledToday]);

  function shiftDay(offset: number) {
    setSelectedDay(format(addDays(parseISO(`${selectedDay}T12:00:00`), offset), "yyyy-MM-dd"));
  }

  function handleDragStart(e: React.DragEvent, id: string) {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  }

  async function handleDrop(column: string) {
    if (!dragId) return;
    const assignee = column === "Unassigned" ? undefined : column;
    await assignRepair(dragId, assignee);
    await scheduleRepair(dragId, selectedDay);
    setDragId(null);
  }

  function allowDrop(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Planning board
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Drag maintenance jobs onto assignees for {format(parseISO(`${selectedDay}T12:00:00`), "EEE d MMM")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Drop a card on a column to assign and schedule in one step.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => shiftDay(-1)}>
              Prev
            </Button>
            <Button
              variant={isToday(parseISO(`${selectedDay}T12:00:00`)) ? "default" : "outline"}
              className="rounded-xl"
              onClick={() => setSelectedDay(todayKey())}
            >
              Today
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={() => shiftDay(1)}>
              Next
            </Button>
            <ExportButtons repairs={repairs} dailyDate={selectedDay} exportLabel={selectedDay} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        {columns.slice(0, 3).map((column) => (
          <Column
            key={column}
            title={column}
            tasks={byColumn[column] ?? []}
            onDrop={() => handleDrop(column)}
            onDragOver={allowDrop}
          />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {columns.slice(3).map((column) => (
          <Column
            key={column}
            title={column}
            tasks={byColumn[column] ?? []}
            onDrop={() => handleDrop(column)}
            onDragOver={allowDrop}
          />
        ))}
      </div>

      <section className="rounded-[1.5rem] border border-dashed border-border/70 bg-muted/15 p-5">
        <h3 className="text-lg font-semibold">Backlog — drag onto a column above</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {backlog.length} unscheduled or other-day maintenance jobs
        </p>
        <div
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          onDragOver={allowDrop}
        >
          {backlog.map((repair) => (
            <TaskChip key={repair.id} repair={repair} onDragStart={handleDragStart} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Column({
  title,
  tasks,
  onDrop,
  onDragOver,
}: {
  title: string;
  tasks: Repair[];
  onDrop: () => void;
  onDragOver: (e: React.DragEvent) => void;
}) {
  return (
    <Card
      className={cn(
        "min-h-[220px] border-border/70 transition-colors",
        "hover:border-primary/30"
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-semibold">
          <span className="truncate">{title}</span>
          <Badge variant="secondary">{tasks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">Drop maintenance jobs here</p>
        ) : (
          tasks.map((repair) => (
            <div key={repair.id}>
              <p className="text-sm font-medium leading-snug">{repair.title}</p>
              <p className="text-xs text-muted-foreground">
                {repair.unit} · {categoryLabels[repair.category]}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                <Badge variant={statusBadgeVariant(repair.status)} className="text-[10px]">
                  {statusLabels[repair.status]}
                </Badge>
                <SlaBadge repair={repair} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
