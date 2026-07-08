import type { Repair } from "@/types/repair";

/** Legacy demo job IDs and keys filtered when loading persisted data. */
const REMOVED_REPAIR_IDS = new Set([
  "GR-2401",
  "GR-2402",
  "GR-2403",
  "GR-2404",
  "GR-2405",
  "GR-2406",
  "GR-2407",
  "GR-2408",
  "GR-2409",
  "GR-2410",
]);

const REMOVED_REPAIR_KEYS = new Set([
  "Electrical issue in 0838|0838|Genesis",
  "Electrical issue in G23|G23|Main",
  "Electrical issue in PH|PH|Lascelles",
]);

export function isRemovedRepair(repair: Repair): boolean {
  if (REMOVED_REPAIR_IDS.has(repair.id)) return true;
  const key = `${repair.title}|${repair.unit}|${repair.building}`;
  return REMOVED_REPAIR_KEYS.has(key);
}
