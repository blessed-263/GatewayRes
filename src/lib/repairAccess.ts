import type { AuthSession } from "@/types/auth";
import type { Repair } from "@/types/repair";

export function repairsForUser(repairs: Repair[], user: AuthSession): Repair[] {
  switch (user.role) {
    case "supervisor":
      return repairs;
    case "worker":
      return repairs.filter((r) => r.assignedTo === user.assigneeName);
    default:
      return [];
  }
}

export function canAccessRepair(repair: Repair, user: AuthSession): boolean {
  return repairsForUser([repair], user).length > 0;
}

export function homePathForRole(role: AuthSession["role"]): string {
  switch (role) {
    case "worker":
      return "/my-jobs";
    default:
      return "/dashboard";
  }
}
