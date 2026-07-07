export const buildingOptions = [
  "Genesis",
  "Lascelles",
  "Main",
  "Truman",
] as const;

export type ComplaintBuilding = (typeof buildingOptions)[number];

const floorCounts: Record<ComplaintBuilding, number> = {
  Genesis: 4,
  Lascelles: 4,
  Main: 31,
  Truman: 6,
};

export function floorsForBuilding(building: ComplaintBuilding): string[] {
  const count = floorCounts[building];
  const floors: string[] = ["Ground"];
  for (let i = 1; i < count; i++) {
    floors.push(String(i));
  }
  return floors;
}

export function floorSortKey(floor: string | undefined): number {
  if (!floor) return Number.MAX_SAFE_INTEGER;
  const normalized = floor.trim().toLowerCase();
  if (normalized === "ground" || normalized === "g") return 0;
  const numeric = parseInt(normalized.replace(/\D/g, ""), 10);
  return Number.isFinite(numeric) ? numeric : Number.MAX_SAFE_INTEGER;
}
