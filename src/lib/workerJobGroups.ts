import { floorSortKey } from "@/data/buildingFloors";
import type { Repair } from "@/types/repair";

function floorForJob(job: Repair): string {
  if (job.floor) return job.floor;
  const match = job.residentPhone?.match(/Floor\s+(.+)/i);
  return match?.[1] ?? "—";
}

export function groupJobsByBuildingAndFloor(jobs: Repair[]) {
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
      const byFloor = new Map<string, Repair[]>();
      for (const job of items) {
        const floor = floorForJob(job);
        const list = byFloor.get(floor) ?? [];
        list.push(job);
        byFloor.set(floor, list);
      }
      return {
        building,
        floors: [...byFloor.entries()]
          .sort(([a], [b]) => floorSortKey(a) - floorSortKey(b))
          .map(([floor, floorJobs]) => ({
            floor,
            jobs: floorJobs.sort((a, b) => a.unit.localeCompare(b.unit)),
          })),
      };
    });
}
