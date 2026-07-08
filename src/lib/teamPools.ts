import type { RepairCategory, Repair } from "@/types/repair";
import { complaintTypeOptions } from "@/lib/complaintTypes";
import { workersInPool } from "@/lib/complaintAssignment";
import { isRepairOverdue } from "@/lib/taskFilters";
import { getTeamProfileByName, teamProfiles, type TeamProfile } from "@/data/teamProfiles";
import { workloadForActive, type WorkloadFilter } from "@/components/dashboard/TeamMemberCard";

export const poolDescriptions: Partial<Record<RepairCategory, string>> = {
  plumbing: "Water, drainage, and bathroom maintenance jobs",
  electrical: "Power, lighting, and wiring faults",
  structural: "Furniture, doors, windows, and fittings",
  pest_control: "Pest walkthroughs and treatment requests",
  other: "Housekeeping and general room issues",
};

export interface TeamMemberWorkload {
  member: TeamProfile;
  active: number;
  pct: number;
  status: WorkloadFilter;
  label: string;
}

export interface WorkPoolSection {
  category: RepairCategory;
  label: string;
  description: string;
  members: TeamMemberWorkload[];
  totalActive: number;
  availableCount: number;
}

const statusOrder: Record<WorkloadFilter, number> = {
  available: 0,
  busy: 1,
  capacity: 2,
  all: 3,
};

export function sortMembersByWorkload(members: TeamMemberWorkload[]) {
  return [...members].sort((a, b) => {
    const byStatus = statusOrder[a.status] - statusOrder[b.status];
    if (byStatus !== 0) return byStatus;
    if (a.active !== b.active) return a.active - b.active;
    return a.member.name.localeCompare(b.member.name);
  });
}

export function groupMembersByWorkloadStatus(members: TeamMemberWorkload[]) {
  const buckets: Record<Exclude<WorkloadFilter, "all">, TeamMemberWorkload[]> = {
    available: [],
    busy: [],
    capacity: [],
  };

  for (const entry of sortMembersByWorkload(members)) {
    if (entry.status === "capacity") buckets.capacity.push(entry);
    else if (entry.status === "busy") buckets.busy.push(entry);
    else buckets.available.push(entry);
  }

  return (
    [
      { status: "available" as const, label: "Available", members: buckets.available },
      { status: "busy" as const, label: "Busy", members: buckets.busy },
      { status: "capacity" as const, label: "At capacity", members: buckets.capacity },
    ] as const
  ).filter((bucket) => bucket.members.length > 0);
}

export function buildWorkPoolSections(
  membersWithWorkload: TeamMemberWorkload[],
  poolFilter: RepairCategory | "all"
): WorkPoolSection[] {
  const pools =
    poolFilter === "all"
      ? complaintTypeOptions
      : complaintTypeOptions.filter((pool) => pool.value === poolFilter);

  return pools.map(({ label, value }) => {
    const workerNames = workersInPool(value);
    const members = sortMembersByWorkload(
      workerNames
        .map((name) => membersWithWorkload.find((entry) => entry.member.name === name))
        .filter((entry): entry is TeamMemberWorkload => Boolean(entry))
    );

    return {
      category: value,
      label,
      description: poolDescriptions[value] ?? "Maintenance jobs routed to this pool",
      members,
      totalActive: members.reduce((sum, entry) => sum + entry.active, 0),
      availableCount: members.filter((entry) => entry.status === "available").length,
    };
  });
}

export function profilesForPool(category: RepairCategory): TeamProfile[] {
  return workersInPool(category)
    .map((name) => getTeamProfileByName(name))
    .filter((profile): profile is TeamProfile => Boolean(profile));
}

export function uniqueWorkersInPools(): TeamProfile[] {
  const names = new Set<string>();
  for (const { value } of complaintTypeOptions) {
    for (const name of workersInPool(value)) {
      names.add(name);
    }
  }
  return teamProfiles.filter((member) => names.has(member.name));
}

/** Friendly team names shown on the Team page group cards. */
export const teamGroupLabels: Partial<Record<RepairCategory, string>> = {
  plumbing: "Plumbing team",
  electrical: "Electrical team",
  structural: "Furniture & fixtures team",
  pest_control: "Pest control team",
  other: "Housekeeping team",
};

export function teamGroupLabel(category: RepairCategory, fallback: string) {
  return teamGroupLabels[category] ?? `${fallback} team`;
}

export interface PoolAnalytics {
  openJobs: number;
  completedJobs: number;
  overdueJobs: number;
}

export function analyticsForPool(repairs: Repair[], category: RepairCategory): PoolAnalytics {
  const inCategory = repairs.filter(
    (repair) => repair.category === category && repair.status !== "cancelled"
  );
  return {
    openJobs: inCategory.filter((repair) => repair.status !== "completed").length,
    completedJobs: inCategory.filter((repair) => repair.status === "completed").length,
    overdueJobs: inCategory.filter(
      (repair) => repair.status !== "completed" && isRepairOverdue(repair)
    ).length,
  };
}

export function buildMembersWithWorkload(
  repairs: Repair[],
  activeByAssignee?: Record<string, number>
): TeamMemberWorkload[] {
  const counts = activeByAssignee ?? {};
  if (Object.keys(counts).length === 0) {
    for (const repair of repairs) {
      if (!repair.assignedTo || ["completed", "cancelled"].includes(repair.status)) continue;
      counts[repair.assignedTo] = (counts[repair.assignedTo] ?? 0) + 1;
    }
  }
  return teamProfiles.map((member) => {
    const active = counts[member.name] ?? 0;
    return { member, active, ...workloadForActive(active) };
  });
}
