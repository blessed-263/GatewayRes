import type { UserRole } from "@/types/auth";

export type LoginPortal = "supervisor" | "maintenance";

export const loginPortals: Record<
  LoginPortal,
  {
    title: string;
    subtitle: string;
    description: string;
    role: UserRole;
    path: string;
  }
> = {
  supervisor: {
    title: "Supervisor dashboard",
    subtitle: "Operations control",
    description: "Oversee open tasks, inventory, team workload, and spending.",
    role: "supervisor",
    path: "/login/supervisor",
  },
  maintenance: {
    title: "Maintenance dashboard",
    subtitle: "Technician workspace",
    description: "View assigned jobs, update progress, request parts, and log proof.",
    role: "worker",
    path: "/login/maintenance",
  },
};

export function portalFromPath(segment: string | undefined): LoginPortal | null {
  if (segment === "supervisor" || segment === "maintenance") {
    return segment;
  }
  return null;
}
