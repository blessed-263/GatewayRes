import type { UserRole } from "@/types/auth";

export interface NavItem {
  path: string;
  label: string;
  mark: string;
  shortLabel: string;
  mobileTab: boolean;
  roles: UserRole[];
}

export const allNavItems: NavItem[] = [
  {
    path: "/dashboard",
    label: "Dashboard",
    mark: "DB",
    shortLabel: "Home",
    mobileTab: true,
    roles: ["supervisor"],
  },
  {
    path: "/my-jobs",
    label: "My Jobs",
    mark: "MJ",
    shortLabel: "Jobs",
    mobileTab: true,
    roles: ["worker"],
  },
  {
    path: "/daily",
    label: "Open Tasks",
    mark: "DY",
    shortLabel: "Open",
    mobileTab: true,
    roles: ["supervisor"],
  },
  {
    path: "/calendar",
    label: "Calendar",
    mark: "CL",
    shortLabel: "Cal",
    mobileTab: true,
    roles: ["supervisor", "worker"],
  },
  {
    path: "/analytics",
    label: "Analytics",
    mark: "AN",
    shortLabel: "Stats",
    mobileTab: false,
    roles: ["supervisor"],
  },
  {
    path: "/budget",
    label: "Budget",
    mark: "BG",
    shortLabel: "Budget",
    mobileTab: false,
    roles: ["supervisor"],
  },
  {
    path: "/inventory",
    label: "Inventory",
    mark: "IV",
    shortLabel: "Inventory",
    mobileTab: false,
    roles: ["supervisor"],
  },
  {
    path: "/team",
    label: "Team",
    mark: "TM",
    shortLabel: "Team",
    mobileTab: false,
    roles: ["supervisor"],
  },
];

export function navForRole(role: UserRole | undefined): NavItem[] {
  if (!role) return [];
  return allNavItems.filter((item) => item.roles.includes(role));
}

export function mobileTabsForRole(role: UserRole | undefined): NavItem[] {
  return navForRole(role).filter((item) => item.mobileTab);
}

export function getPageTitle(pathname: string, role?: UserRole): string {
  const items = role ? navForRole(role) : allNavItems;
  const exact = items.find((item) => item.path === pathname);
  if (exact) return exact.label;
  if (pathname === "/tasks") return "All Tasks";
  if (pathname.startsWith("/my-jobs/")) return "Job";
  if (pathname.startsWith("/tasks/")) return "Repair";
  const prefix = items.find(
    (item) => item.path !== "/dashboard" && pathname.startsWith(item.path)
  );
  return prefix?.label ?? "Gateway";
}
