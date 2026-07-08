import { differenceInSeconds, intervalToDuration } from "date-fns";
import type { Repair, WorkTimeSession } from "@/types/repair";

export function formatWorkDuration(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  if (safe < 60) return `${safe}s`;
  const duration = intervalToDuration({ start: 0, end: safe * 1000 });
  const parts: string[] = [];
  if (duration.hours) parts.push(`${duration.hours}h`);
  if (duration.minutes) parts.push(`${duration.minutes}m`);
  if (!duration.hours && duration.seconds) parts.push(`${duration.seconds}s`);
  return parts.join(" ") || "0s";
}

export function activeSession(repair: Repair): WorkTimeSession | undefined {
  return repair.workSessions?.find((session) => !session.endedAt);
}

export function completedSessions(repair: Repair): WorkTimeSession[] {
  return (repair.workSessions ?? []).filter((session) => session.endedAt);
}

export function totalWorkSeconds(repair: Repair, now = Date.now()) {
  return (repair.workSessions ?? []).reduce((sum, session) => {
    const end = session.endedAt ? new Date(session.endedAt).getTime() : now;
    const start = new Date(session.startedAt).getTime();
    return sum + Math.max(0, differenceInSeconds(end, start));
  }, 0);
}

export function sessionDurationSeconds(session: WorkTimeSession, now = Date.now()) {
  const end = session.endedAt ? new Date(session.endedAt).getTime() : now;
  const start = new Date(session.startedAt).getTime();
  return Math.max(0, differenceInSeconds(end, start));
}

export function findWorkerActiveSession(
  repairs: Repair[],
  workerName: string
): { repair: Repair; session: WorkTimeSession } | undefined {
  for (const repair of repairs) {
    const session = repair.workSessions?.find(
      (entry) => !entry.endedAt && entry.workerName === workerName
    );
    if (session) return { repair, session };
  }
  return undefined;
}

export function lastEndedAtForWorker(repairs: Repair[], workerName: string): string | undefined {
  let latest: string | undefined;
  for (const repair of repairs) {
    for (const session of repair.workSessions ?? []) {
      if (session.workerName !== workerName || !session.endedAt) continue;
      if (!latest || session.endedAt > latest) latest = session.endedAt;
    }
  }
  return latest;
}

export function gapBeforeStartSeconds(
  repairs: Repair[],
  workerName: string,
  startedAt: string
) {
  const lastEnded = lastEndedAtForWorker(repairs, workerName);
  if (!lastEnded) return 0;
  return Math.max(0, differenceInSeconds(new Date(startedAt), new Date(lastEnded)));
}

export function formatGapLabel(gapSeconds: number) {
  if (gapSeconds <= 0) return "Started immediately";
  return `${formatWorkDuration(gapSeconds)} since last job`;
}
