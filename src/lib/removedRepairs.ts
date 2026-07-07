import type { Repair } from "@/types/repair";

const REMOVED_REPAIR_IDS = new Set([
  "GR-2402",
  "GR-2405",
  "GR-2406",
  "GR-2408",
  "GR-2410",
]);

const REMOVED_REPAIR_KEYS = new Set([
  "Electrical issue in 0838|0838|Genesis",
  "Electrical issue in G23|G23|Main",
  "Electrical issue in PH|PH|Lascelles",
  "Toilet cistern running|A401|Lascelles",
  "AC unit not cooling|B310|Genesis",
  "Power outlet sparking|C204|Claim Street Main",
  "Bedroom light not working|A112|Lascelles",
  "Door lock jammed|A205|Lascelles",
]);

export function isRemovedRepair(repair: Repair): boolean {
  if (REMOVED_REPAIR_IDS.has(repair.id)) return true;
  const key = `${repair.title}|${repair.unit}|${repair.building}`;
  return REMOVED_REPAIR_KEYS.has(key);
}
