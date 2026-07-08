import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { Check, ChevronDown, Clock, Package, Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRepairs } from "@/context/RepairsContext";
import {
  activeSession,
  completedSessions,
  formatGapLabel,
  formatWorkDuration,
  isBackgroundTimerRunning,
  sessionDurationSeconds,
  totalWorkSeconds,
} from "@/lib/workTime";
import { statusLabels } from "@/lib/repairLabels";
import { cn } from "@/lib/utils";
import type { Repair, RepairStatus } from "@/types/repair";

interface TaskWorkTimerProps {
  repair: Repair;
  className?: string;
  interactive?: boolean;
  actor?: string;
  onUpdated?: (repair: Repair) => void;
  onRequestComplete?: () => void;
}

export function TaskWorkTimer({
  repair,
  className,
  interactive = false,
  actor = "Staff",
  onUpdated,
  onRequestComplete,
}: TaskWorkTimerProps) {
  const { updateRepairStatus, getRepairById } = useRepairs();
  const [now, setNow] = useState(Date.now());
  const [saving, setSaving] = useState(false);

  const running = activeSession(repair);
  const isRunning = isBackgroundTimerRunning(repair);
  const history = completedSessions(repair);
  const totalSeconds = totalWorkSeconds(repair, now);
  const currentSeconds = running ? sessionDurationSeconds(running, now) : 0;
  const isTerminal = repair.status === "completed" || repair.status === "cancelled";
  const canControl = interactive && !isTerminal && Boolean(actor);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  async function applyStatus(status: RepairStatus) {
    setSaving(true);
    try {
      await updateRepairStatus(repair.id, status, actor);
      const updated = getRepairById(repair.id);
      if (updated) onUpdated?.(updated);
    } finally {
      setSaving(false);
    }
  }

  function handleStart() {
    void applyStatus("in_progress");
  }

  function handleStopChoice(status: RepairStatus) {
    if (status === "completed") {
      onRequestComplete?.();
      return;
    }
    void applyStatus(status);
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-5",
        isRunning && "border-primary/30 bg-primary/[0.03]",
        className
      )}
    >
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Clock className="h-4 w-4" />
          Work timer
        </h2>
        <p className="mt-2 font-heading text-3xl font-semibold tabular-nums tracking-tight text-foreground">
          {isRunning ? formatWorkDuration(currentSeconds) : formatWorkDuration(totalSeconds)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {isRunning
            ? "Timer running — tap Stop when you pause or finish"
            : isTerminal
              ? totalSeconds > 0
                ? "Total time logged on this job"
                : "No work time recorded"
              : totalSeconds > 0
                ? "Total time logged on this job"
                : canControl
                  ? "Tap Start when you begin work on this job"
                  : "No work time recorded yet"}
        </p>
      </div>

      {canControl ? (
        <div className="mt-4">
          {isRunning ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl sm:w-auto"
                  disabled={saving}
                >
                  <Square className="mr-2 h-4 w-4 fill-current" />
                  {saving ? "Saving…" : "Stop"}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-xl">
                <DropdownMenuItem
                  className="rounded-lg"
                  onClick={() => handleStopChoice("open")}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Pause work
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-lg"
                  onClick={() => handleStopChoice("awaiting_parts")}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Awaiting parts
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-lg"
                  onClick={() => handleStopChoice("completed")}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Complete job
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              type="button"
              className="w-full rounded-xl sm:w-auto"
              disabled={saving}
              onClick={handleStart}
            >
              <Play className="mr-2 h-4 w-4" />
              {saving ? "Starting…" : "Start work"}
            </Button>
          )}
        </div>
      ) : null}

      {isRunning && running ? (
        <div className="mt-4 space-y-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-3 text-sm">
          <p>
            <span className="font-medium text-foreground">Started:</span>{" "}
            {format(parseISO(running.startedAt), "d MMM yyyy · HH:mm:ss")}
          </p>
          {running.gapBeforeSeconds ? (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Between jobs:</span>{" "}
              {formatGapLabel(running.gapBeforeSeconds)}
            </p>
          ) : null}
        </div>
      ) : null}

      {repair.status === "completed" && repair.completedAt && totalSeconds > 0 ? (
        <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 px-3 py-3 text-sm">
          <p>
            <span className="font-medium text-foreground">Completed:</span>{" "}
            {format(parseISO(repair.completedAt), "d MMM yyyy · HH:mm:ss")}
          </p>
          <p className="mt-1 text-muted-foreground">
            Recorded work time while status was {statusLabels.in_progress}.
          </p>
        </div>
      ) : null}

      {history.length > 0 ? (
        <div className="mt-5 space-y-2 border-t border-border/60 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Sessions
          </p>
          {history.map((session) => (
            <div
              key={session.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/25 px-3 py-2 text-sm"
            >
              <span className="text-muted-foreground">
                {format(parseISO(session.startedAt), "d MMM · HH:mm")}
                {session.endedAt ? ` – ${format(parseISO(session.endedAt), "HH:mm")}` : ""}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {session.gapBeforeSeconds ? (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    Gap {formatWorkDuration(session.gapBeforeSeconds)}
                  </span>
                ) : null}
                <span className="font-semibold tabular-nums text-foreground">
                  {formatWorkDuration(sessionDurationSeconds(session))}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
