import { complaintLabelForCategory } from "@/lib/complaintTypes";
import { isRepairOverdue } from "@/lib/taskFilters";
import type { Repair, RepairCategory } from "@/types/repair";

export interface WorkerAnalytics {
  assignedActive: number;
  pending: number;
  inProgress: number;
  awaitingParts: number;
  completedAssigned: number;
  completedClosedBy: number;
  overdue: number;
  totalHandled: number;
  byCategory: { category: RepairCategory; label: string; count: number }[];
}

export function analyticsForWorker(
  repairs: Repair[],
  workerName: string
): WorkerAnalytics {
  const assigned = repairs.filter(
    (repair) =>
      repair.assignedTo === workerName && repair.status !== "cancelled"
  );
  const active = assigned.filter((repair) => repair.status !== "completed");
  const completedAssigned = assigned.filter(
    (repair) => repair.status === "completed"
  ).length;
  const completedClosedBy = repairs.filter(
    (repair) =>
      repair.closedBy === workerName && repair.status === "completed"
  ).length;

  const categoryCounts = new Map<RepairCategory, number>();
  for (const repair of assigned) {
    categoryCounts.set(
      repair.category,
      (categoryCounts.get(repair.category) ?? 0) + 1
    );
  }

  const byCategory = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({
      category,
      label: complaintLabelForCategory(category),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    assignedActive: active.length,
    pending: active.filter((repair) => repair.status === "open").length,
    inProgress: active.filter((repair) => repair.status === "in_progress")
      .length,
    awaitingParts: active.filter(
      (repair) => repair.status === "awaiting_parts"
    ).length,
    completedAssigned,
    completedClosedBy,
    overdue: active.filter((repair) => isRepairOverdue(repair)).length,
    totalHandled: assigned.length,
    byCategory,
  };
}

export function activeTasksForWorker(repairs: Repair[], workerName: string) {
  return repairs
    .filter(
      (repair) =>
        repair.assignedTo === workerName &&
        !["completed", "cancelled"].includes(repair.status)
    )
    .sort(
      (a, b) =>
        new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    );
}

export function recentHistoryForWorker(
  repairs: Repair[],
  workerName: string,
  limit = 12
) {
  return repairs
    .filter((repair) => repair.assignedTo === workerName)
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.reportedAt).getTime() -
        new Date(a.updatedAt ?? a.reportedAt).getTime()
    )
    .slice(0, limit);
}
