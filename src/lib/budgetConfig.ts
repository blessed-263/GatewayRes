import type { RepairCategory, RepairPriority, RepairStatus } from "@/types/repair";
import { brandColors } from "@/lib/brandColors";

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
  plumbing: { bg: "bg-[#1F5F49]", text: "text-white", bar: brandColors.primaryDeeper },
  electrical: { bg: "bg-[#3A8F6E]", text: "text-white", bar: brandColors.primary },
  hvac: { bg: "bg-[#55B896]", text: "text-white", bar: brandColors.greenMid },
  structural: { bg: "bg-[#2D7259]", text: "text-white", bar: brandColors.primaryDark },
  painting: { bg: "bg-[#F7941D]", text: "text-white", bar: brandColors.orange },
  appliance: { bg: "bg-[#6BC4A8]", text: "text-white", bar: brandColors.greenLight },
  pest_control: { bg: "bg-[#8FD4BC]", text: "text-[#1F5F49]", bar: brandColors.greenMuted },
  other: { bg: "bg-[#7BDCB5]", text: "text-[#1F5F49]", bar: brandColors.mint },
};

export const priorityBadge: Record<RepairPriority, string> = {
  urgent: "bg-red-600 text-white",
  high: "bg-red-500 text-white",
  medium: "bg-amber-500 text-white",
  low: "bg-[#55B896] text-white",
};

/** Real `RepairStatus` values only; kept in sync with src/types/repair.ts */
export const dashboardStatusBadge: Record<RepairStatus, string> = {
  open: "bg-[#6BC4A8] text-[#1F5F49]",
  awaiting_parts: "bg-amber-500 text-white",
  in_progress: "bg-[#3A8F6E] text-white",
  completed: "bg-[#2D7259] text-white",
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
