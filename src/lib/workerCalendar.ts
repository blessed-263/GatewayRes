import {
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
} from "date-fns";
import type { Repair, RepairStatus } from "@/types/repair";

export type CalendarStatusFilter = "all" | RepairStatus;

const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };

export const calendarStatusFilters: {
  id: CalendarStatusFilter;
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Pending" },
  { id: "in_progress", label: "In Progress" },
  { id: "awaiting_parts", label: "Awaiting Parts" },
  { id: "completed", label: "Completed" },
];

export function matchesCalendarStatus(
  repair: Repair,
  filter: CalendarStatusFilter
): boolean {
  if (repair.status === "cancelled") return false;
  if (filter === "all") return true;
  return repair.status === filter;
}

export function scheduledRepairs(
  repairs: Repair[],
  filter: CalendarStatusFilter
): Repair[] {
  return repairs.filter(
    (r) => r.scheduledFor && matchesCalendarStatus(r, filter)
  );
}

export function jobsForDate(
  repairs: Repair[],
  dateKey: string,
  filter: CalendarStatusFilter
): Repair[] {
  return scheduledRepairs(repairs, filter)
    .filter((r) => r.scheduledFor === dateKey)
    .sort((a, b) => {
      const p = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (p !== 0) return p;
      return a.title.localeCompare(b.title);
    });
}

export function countsForMonth(
  repairs: Repair[],
  month: Date,
  filter: CalendarStatusFilter
): Record<string, number> {
  const monthKey = format(month, "yyyy-MM");
  const counts: Record<string, number> = {};

  for (const repair of scheduledRepairs(repairs, filter)) {
    const day = repair.scheduledFor!;
    if (!day.startsWith(monthKey)) continue;
    counts[day] = (counts[day] ?? 0) + 1;
  }

  return counts;
}

export function monthGridDays(month: Date): Date[] {
  return eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  });
}

export function futureJobCount(
  repairs: Repair[],
  filter: CalendarStatusFilter,
  fromDate = new Date()
): number {
  const fromKey = format(fromDate, "yyyy-MM-dd");
  return scheduledRepairs(repairs, filter).filter(
    (r) => r.scheduledFor! >= fromKey
  ).length;
}

export function todayKey(): string {
  return format(new Date(), "yyyy-MM-dd");
}
