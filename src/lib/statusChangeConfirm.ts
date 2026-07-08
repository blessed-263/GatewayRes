import { statusLabels } from "@/lib/repairLabels";
import type { RepairStatus } from "@/types/repair";

export function statusChangeConfirmMessage(
  from: RepairStatus,
  to: RepairStatus,
  jobTitle: string
) {
  const fromLabel = statusLabels[from];
  const toLabel = statusLabels[to];

  if (to === "in_progress") {
    return `Start work on "${jobTitle}"? Status will change to ${toLabel}.`;
  }
  if (to === "completed") {
    return `Mark "${jobTitle}" as ${toLabel}? The work timer will stop and the completion time will be saved.`;
  }
  return `Change "${jobTitle}" from ${fromLabel} to ${toLabel}?`;
}
