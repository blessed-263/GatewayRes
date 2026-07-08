import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { Clock } from "lucide-react";
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
import type { Repair } from "@/types/repair";

interface TaskWorkTimerProps {
  repair: Repair;
  className?: string;
}

export function TaskWorkTimer({ repair, className }: TaskWorkTimerProps) {
  const [now, setNow] = useState(Date.now());

  const running = activeSession(repair);
  const isRunning = isBackgroundTimerRunning(repair);
  const history = completedSessions(repair);
  const totalSeconds = totalWorkSeconds(repair, now);
  const currentSeconds = running ? sessionDurationSeconds(running, now) : 0;

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

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
            ? "Running in the background while status is In Progress"
            : totalSeconds > 0
              ? "Total time logged on this job"
              : "Starts automatically when you set status to In Progress"}
        </p>
      </div>

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
