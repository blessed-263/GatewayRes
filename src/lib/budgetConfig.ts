import type { RepairCategory, RepairPriority, RepairStatus } from "@/types/repair";

export const budgetAllocations: Record<RepairCategory, number> = {
  plumbing: 2000,
  electrical: 1500,
  hvac: 1000,
  structural: 1200,
  painting: 800,
  appliance: 600,
  pest_control: 500,
  other: 400,
};

export const categoryColors: Record<
  RepairCategory,
  { bg: string; text: string; bar: string }
> = {
  plumbing: { bg: "bg-[#1a6b72]", text: "text-white", bar: "#1a6b72" },
  electrical: { bg: "bg-[#2a9099]", text: "text-white", bar: "#2a9099" },
  hvac: { bg: "bg-[#3aabb3]", text: "text-white", bar: "#3aabb3" },
  structural: { bg: "bg-[#4b6a8a]", text: "text-white", bar: "#4b6a8a" },
  painting: { bg: "bg-[#6a8faf]", text: "text-white", bar: "#6a8faf" },
  appliance: { bg: "bg-[#2c5f78]", text: "text-white", bar: "#2c5f78" },
  pest_control: { bg: "bg-[#5ba3ab]", text: "text-white", bar: "#5ba3ab" },
  other: { bg: "bg-[#7a9daf]", text: "text-white", bar: "#7a9daf" },
};

export const priorityBadge: Record<RepairPriority, string> = {
  urgent: "bg-red-600 text-white",
  high: "bg-red-500 text-white",
  medium: "bg-amber-500 text-white",
  low: "bg-[#3aabb3] text-white",
};

/** Real `RepairStatus` values only; kept in sync with src/types/repair.ts */
export const dashboardStatusBadge: Record<RepairStatus, string> = {
  open: "bg-[#3aabb3] text-white",
  awaiting_parts: "bg-amber-500 text-white",
  in_progress: "bg-[#2a9099] text-white",
  completed: "bg-emerald-600 text-white",
  cancelled: "bg-red-500 text-white",
};

export const dashboardStatusLabel: Record<RepairStatus, string> = {
  open: "New",
  awaiting_parts: "Awaiting Parts",
  in_progress: "In Progress",
  completed: "Done",
  cancelled: "Cancelled",
};

export function formatZar(amount: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function repairLocation(unit: string, building: string) {
  return `${unit} · ${building}`;
}
