import {
  eachDayOfInterval,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
} from "date-fns";
import type { Repair } from "@/types/repair";

const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };

export type CalendarViewMode = "scheduled" | "reported";

export const calendarViewModes: { id: CalendarViewMode; label: string }[] = [
  { id: "scheduled", label: "Scheduled work" },
  { id: "reported", label: "New requests" },
];

export function monthGridDays(month: Date): Date[] {
  return eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  });
}

export function scheduledCountsForMonth(
  repairs: Repair[],
  month: Date
): Record<string, number> {
  const monthKey = format(month, "yyyy-MM");
  const counts: Record<string, number> = {};

  for (const repair of repairs) {
    if (repair.status === "cancelled" || !repair.scheduledFor) continue;
    if (!repair.scheduledFor.startsWith(monthKey)) continue;
    counts[repair.scheduledFor] = (counts[repair.scheduledFor] ?? 0) + 1;
  }

  return counts;
}

export function reportedCountsForMonth(
  repairs: Repair[],
  month: Date
): Record<string, number> {
  const monthKey = format(month, "yyyy-MM");
  const counts: Record<string, number> = {};

  for (const repair of repairs) {
    if (repair.status === "cancelled") continue;
    const key = format(parseISO(repair.reportedAt), "yyyy-MM-dd");
    if (!key.startsWith(monthKey)) continue;
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return counts;
}

function sortTasks(tasks: Repair[]) {
  return [...tasks].sort((a, b) => {
    const p = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (p !== 0) return p;
    return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
  });
}

export function scheduledTasksForDate(repairs: Repair[], dateKey: string) {
  return sortTasks(
    repairs.filter(
      (repair) =>
        repair.scheduledFor === dateKey && repair.status !== "cancelled"
    )
  );
}

export function reportedTasksForDate(repairs: Repair[], dateKey: string) {
  return sortTasks(
    repairs.filter((repair) => {
      if (repair.status === "cancelled") return false;
      return format(parseISO(repair.reportedAt), "yyyy-MM-dd") === dateKey;
    })
  );
}

export function tasksForCalendarDate(
  repairs: Repair[],
  dateKey: string,
  mode: CalendarViewMode
) {
  return mode === "scheduled"
    ? scheduledTasksForDate(repairs, dateKey)
    : reportedTasksForDate(repairs, dateKey);
}

export function todayKey(): string {
  return format(new Date(), "yyyy-MM-dd");
}
