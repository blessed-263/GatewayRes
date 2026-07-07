import type { RepairPriority } from "@/types/repair";
import type { SlaTargets } from "@/types/operations";

export const slaByPriority: Record<RepairPriority, SlaTargets> = {
  urgent: { respondHours: 1, resolveHours: 8 },
  high: { respondHours: 4, resolveHours: 24 },
  medium: { respondHours: 8, resolveHours: 72 },
  low: { respondHours: 24, resolveHours: 168 },
};

/** Repairs above this estimated cost require supervisor approval before work proceeds. */
export const HIGH_COST_APPROVAL_THRESHOLD = 5000;
