import { format, parseISO } from "date-fns";
import type { Repair } from "@/types/repair";

const today = () => format(new Date(), "yyyy-MM-dd");

export function isRepairOverdue(repair: Repair): boolean {
  if (repair.status === "completed" || repair.status === "cancelled") return false;
  const scheduledOverdue =
    repair.scheduledFor != null && repair.scheduledFor < today();
  const slaOverdue =
    repair.slaResolveBy != null && parseISO(repair.slaResolveBy) < new Date();
  return scheduledOverdue || slaOverdue || repair.slaBreached === true;
}

export function isRepairPending(repair: Repair): boolean {
  return repair.status === "open" || repair.status === "in_progress";
}

export type SupervisorTaskFilter =
  | "all"
  | "unassigned"
  | "assigned"
  | "pending"
  | "completed"
  | "awaiting_stock"
  | "past_due";

export const supervisorTaskFilters: {
  id: SupervisorTaskFilter;
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "unassigned", label: "Unassigned" },
  { id: "assigned", label: "Assigned" },
  { id: "pending", label: "Pending" },
  { id: "completed", label: "Completed" },
  { id: "awaiting_stock", label: "Awaiting Stock" },
  { id: "past_due", label: "Past Due" },
];

export function parseSupervisorTaskFilter(
  value: string | null
): SupervisorTaskFilter {
  if (value === "open") return "pending";
  if (
    supervisorTaskFilters.some((item) => item.id === value)
  ) {
    return value as SupervisorTaskFilter;
  }
  return "all";
}

export function matchesSupervisorTaskFilter(
  repair: Repair,
  filter: SupervisorTaskFilter
): boolean {
  if (repair.status === "cancelled") return false;
  switch (filter) {
    case "all":
      return true;
    case "unassigned":
      return !repair.assignedTo && repair.status !== "completed";
    case "assigned":
      return Boolean(repair.assignedTo) && repair.status !== "completed";
    case "pending":
      return isRepairPending(repair);
    case "completed":
      return repair.status === "completed";
    case "awaiting_stock":
      return repair.status === "awaiting_parts";
    case "past_due":
      return isRepairOverdue(repair);
  }
}

export type WorkerFilter = "total" | "pending" | "overdue" | "awaiting_parts";

export function matchesWorkerFilter(repair: Repair, filter: WorkerFilter): boolean {
  if (repair.status === "cancelled") return false;
  switch (filter) {
    case "total":
      return repair.status !== "completed";
    case "pending":
      return isRepairPending(repair);
    case "overdue":
      return isRepairOverdue(repair);
    case "awaiting_parts":
      return repair.status === "awaiting_parts";
  }
}
