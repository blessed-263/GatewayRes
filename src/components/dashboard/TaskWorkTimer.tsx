import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { Clock, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  activeSession,
  completedSessions,
  formatGapLabel,
  formatWorkDuration,
  sessionDurationSeconds,
  totalWorkSeconds,
} from "@/lib/workTime";
import { cn } from "@/lib/utils";
import type { Repair } from "@/types/repair";

interface TaskWorkTimerProps {
  repair: Repair;
  workerName: string;
  onStart: () => Promise<void>;
  onEnd: () => Promise<void>;
  readOnly?: boolean;
  className?: string;
}

export function TaskWorkTimer({
  repair,
  workerName,
  onStart,
  onEnd,
  readOnly = false,
  className,
}: TaskWorkTimerProps) {
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());

  const running = activeSession(repair);
  const isRunningHere = running?.workerName === workerName;
  const history = completedSessions(repair);
  const totalSeconds = totalWorkSeconds(repair, now);
  const currentSeconds = running ? sessionDurationSeconds(running, now) : 0;

  useEffect(() => {
    if (!isRunningHere) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isRunningHere]);

  async function handleStart() {
    setBusy(true);
    try {
      await onStart();
    } finally {
      setBusy(false);
    }
  }

  async function handleEnd() {
    setBusy(true);
    try {
      await onEnd();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-5",
        isRunningHere && "border-primary/30 bg-primary/[0.03]",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Clock className="h-4 w-4" />
            Work timer
          </h2>
          <p className="mt-2 font-heading text-3xl font-semibold tabular-nums tracking-tight text-foreground">
            {isRunningHere ? formatWorkDuration(currentSeconds) : formatWorkDuration(totalSeconds)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isRunningHere
              ? "Timer running on this job"
              : totalSeconds > 0
                ? "Total time logged on this job"
                : "No time logged yet"}
          </p>
        </div>

        {!readOnly && repair.status !== "completed" && repair.status !== "cancelled" ? (
          <div className="flex flex-wrap gap-2">
            {!isRunningHere ? (
              <Button
                type="button"
                className="rounded-xl"
                disabled={busy}
                onClick={() => void handleStart()}
              >
                <Play className="mr-2 h-4 w-4" />
                Start
              </Button>
            ) : (
              <Button
                type="button"
                variant="destructive"
                className="rounded-xl"
                disabled={busy}
                onClick={() => void handleEnd()}
              >
                <Square className="mr-2 h-4 w-4" />
                End
              </Button>
            )}
          </div>
        ) : null}
      </div>

      {running && !isRunningHere ? (
        <p className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
          Another job timer is active for {running.workerName}. Starting here will end that timer
          first.
        </p>
      ) : null}

      {isRunningHere && running?.gapBeforeSeconds ? (
        <p className="mt-4 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Between jobs:</span>{" "}
          {formatGapLabel(running.gapBeforeSeconds)}
        </p>
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
