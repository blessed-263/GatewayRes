import type { RepairCategory } from "@/types/repair";
import { DEFAULT_ASSIGNEE } from "@/lib/assigneeNames";

const workersByCategory: Partial<Record<RepairCategory, string[]>> = {
  plumbing: ["Sipho N."],
  electrical: ["Lerato M."],
  structural: ["James M.", "David W."],
  appliance: ["James M.", "Given K."],
  hvac: ["Given K."],
  pest_control: ["Zanele R."],
  painting: ["Given K."],
  other: ["Given K.", "Zanele R."],
};

export function workersForCategory(category: RepairCategory): string[] {
  return workersByCategory[category] ?? [DEFAULT_ASSIGNEE];
}

export function pickRandomAssignee(category: RepairCategory): string | undefined {
  const pool = workersForCategory(category);
  if (pool.length === 0) return undefined;
  return pool[Math.floor(Math.random() * pool.length)];
}
