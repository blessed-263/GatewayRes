import { format, parseISO, startOfDay, subDays } from "date-fns";
import { complaintTypeOptions } from "@/lib/complaintTypes";
import { isRepairOverdue } from "@/lib/taskFilters";
import type { Repair, RepairCategory } from "@/types/repair";

export interface KpiCounts {
  total: number;
  needsAttention: number;
  completed: number;
  overdue: number;
}

export function countKpis(repairs: Repair[]): KpiCounts {
  const active = repairs.filter((r) => r.status !== "cancelled");
  return {
    total: active.length,
    needsAttention: active.filter((r) =>
      ["open", "in_progress", "awaiting_parts"].includes(r.status)
    ).length,
    completed: active.filter((r) => r.status === "completed").length,
    overdue: active.filter((r) => isRepairOverdue(r)).length,
  };
}

export function countByComplaintType(repairs: Repair[]): { category: RepairCategory; label: string; count: number }[] {
  return complaintTypeOptions.map(({ label, value }) => ({
    category: value,
    label,
    count: repairs.filter((r) => r.category === value && r.status !== "cancelled").length,
  }));
}

export function rankWorkersByClosed(repairs: Repair[]): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const r of repairs) {
    if (r.status !== "completed" || !r.closedBy) continue;
    counts[r.closedBy] = (counts[r.closedBy] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function rankWorkersByOpen(repairs: Repair[]): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const r of repairs) {
    if (!r.assignedTo || ["completed", "cancelled"].includes(r.status)) continue;
    counts[r.assignedTo] = (counts[r.assignedTo] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function countByDay(repairs: Repair[], days: Date[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const day of days) {
    counts[format(day, "yyyy-MM-dd")] = 0;
  }
  for (const r of repairs) {
    if (r.status === "cancelled") continue;
    const key = format(parseISO(r.reportedAt), "yyyy-MM-dd");
    if (key in counts) counts[key]++;
  }
  return counts;
}

export function heatmapDays(windowDays = 31): Date[] {
  const end = startOfDay(new Date());
  const days: Date[] = [];
  for (let i = 0; i < windowDays; i++) {
    days.push(subDays(end, windowDays - 1 - i));
  }
  return days;
}

export function countScheduledCalendar(
  repairs: Repair[],
  reference = new Date()
): { today: number; monthTotal: number; openTasks: number } {
  const today = format(reference, "yyyy-MM-dd");
  const monthKey = format(reference, "yyyy-MM");
  const active = repairs.filter((r) => r.status !== "cancelled");

  return {
    today: active.filter((r) => r.scheduledFor === today).length,
    monthTotal: active.filter((r) => r.scheduledFor?.startsWith(monthKey)).length,
    openTasks: active.filter((r) => r.status === "open").length,
  };
}
