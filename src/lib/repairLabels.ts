import type {
  RepairCategory,
  RepairPriority,
  RepairStatus,
} from "@/types/repair";

export const statusLabels: Record<RepairStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  awaiting_parts: "Awaiting Parts",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const priorityLabels: Record<RepairPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const categoryLabels: Record<RepairCategory, string> = {
  plumbing: "Plumbing",
  electrical: "Electrical",
  hvac: "HVAC",
  structural: "Structural",
  appliance: "Appliance",
  pest_control: "Pest Ctrl",
  painting: "Painting",
  other: "Other",
};

export function statusBadgeVariant(
  status: RepairStatus
): "default" | "secondary" | "warning" | "success" | "muted" | "destructive" {
  switch (status) {
    case "open":
      return "secondary";
    case "in_progress":
      return "default";
    case "awaiting_parts":
      return "warning";
    case "completed":
      return "success";
    case "cancelled":
      return "muted";
  }
}

export function priorityBadgeVariant(
  priority: RepairPriority
): "muted" | "secondary" | "warning" | "destructive" {
  switch (priority) {
    case "low":
      return "muted";
    case "medium":
      return "secondary";
    case "high":
      return "warning";
    case "urgent":
      return "destructive";
  }
}
