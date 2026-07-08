import type { PropertySite } from "@/types/operations";
import { floorSortKey } from "@/data/buildingFloors";
import type { Repair } from "@/types/repair";

export function normalizeRoomCode(code: string) {
  return code.trim().toUpperCase();
}

export function buildingNamesMatch(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** Match kiosk / legacy room codes to property master unit codes (e.g. C101 ↔ 101). */
export function roomCodesMatch(repairUnit: string, propertyCode: string) {
  const repair = normalizeRoomCode(repairUnit);
  const property = normalizeRoomCode(propertyCode);
  if (repair === property) return true;

  const repairNumeric = repair.replace(/^[A-Z]+/, "");
  const propertyNumeric = property.replace(/^[A-Z]+/, "");
  if (repairNumeric && repairNumeric === property) return true;
  if (propertyNumeric && repair === propertyNumeric) return true;
  if (repairNumeric && propertyNumeric && repairNumeric === propertyNumeric) return true;
  return false;
}

export function repairsForRoom(
  repairs: Repair[],
  building: string,
  unitCode: string,
  { includeCompleted = true }: { includeCompleted?: boolean } = {}
) {
  return repairs
    .filter((repair) => {
      if (repair.status === "cancelled") return false;
      if (!includeCompleted && repair.status === "completed") return false;
      if (!buildingNamesMatch(repair.building, building)) return false;
      return roomCodesMatch(repair.unit, unitCode);
    })
    .sort(
      (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    );
}

export function activeJobCountForRoom(
  repairs: Repair[],
  building: string,
  unitCode: string
) {
  return repairsForRoom(repairs, building, unitCode, { includeCompleted: false }).filter(
    (repair) => repair.status !== "completed"
  ).length;
}

export interface RoomJobGroup {
  unitCode: string;
  unitId: string;
  unitType: "room" | "common" | "utility";
  beds?: number;
  jobs: Repair[];
  activeCount: number;
}

export interface FloorJobGroup {
  floorId: string;
  floorName: string;
  rooms: RoomJobGroup[];
  jobCount: number;
  activeCount: number;
}

export interface BuildingJobGroup {
  siteId: string;
  building: string;
  address: string;
  floors: FloorJobGroup[];
  jobCount: number;
  activeCount: number;
}

export function groupJobsByProperty(
  repairs: Repair[],
  sites: PropertySite[]
): BuildingJobGroup[] {
  return sites.map((site) => {
    const floors: FloorJobGroup[] = site.floors.map((floor) => {
      const rooms: RoomJobGroup[] = floor.units.map((unit) => {
        const jobs = repairsForRoom(repairs, site.name, unit.code);
        const activeCount = jobs.filter(
          (job) => !["completed", "cancelled"].includes(job.status)
        ).length;
        return {
          unitCode: unit.code,
          unitId: unit.id,
          unitType: unit.type,
          beds: unit.beds,
          jobs,
          activeCount,
        };
      });

      const jobCount = rooms.reduce((sum, room) => sum + room.jobs.length, 0);
      const activeCount = rooms.reduce((sum, room) => sum + room.activeCount, 0);

      return {
        floorId: floor.id,
        floorName: floor.name,
        rooms,
        jobCount,
        activeCount,
      };
    });

    const jobCount = floors.reduce((sum, floor) => sum + floor.jobCount, 0);
    const activeCount = floors.reduce((sum, floor) => sum + floor.activeCount, 0);

    return {
      siteId: site.id,
      building: site.name,
      address: site.address,
      floors,
      jobCount,
      activeCount,
    };
  });
}

export function groupJobsByBuildingFloorAndRoom(jobs: Repair[]) {
  const byBuilding = new Map<string, Repair[]>();
  for (const job of jobs) {
    const building = job.building || "Unknown";
    const list = byBuilding.get(building) ?? [];
    list.push(job);
    byBuilding.set(building, list);
  }

  return [...byBuilding.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([building, items]) => {
      const byFloor = new Map<string, Map<string, Repair[]>>();

      for (const job of items) {
        const floor = job.floor?.trim() || "—";
        const unit = job.unit?.trim() || "—";
        if (!byFloor.has(floor)) byFloor.set(floor, new Map());
        const byUnit = byFloor.get(floor)!;
        const list = byUnit.get(unit) ?? [];
        list.push(job);
        byUnit.set(unit, list);
      }

      return {
        building,
        floors: [...byFloor.entries()]
          .sort(([a], [b]) => floorSortKey(a) - floorSortKey(b))
          .map(([floor, unitsMap]) => ({
            floor,
            rooms: [...unitsMap.entries()]
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([unit, roomJobs]) => ({
                unit,
                jobs: roomJobs.sort((a, b) => a.unit.localeCompare(b.unit)),
              })),
          })),
      };
    });
}
