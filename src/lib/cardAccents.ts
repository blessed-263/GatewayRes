import type { WorkerFilter } from "@/lib/taskFilters";

export type FilterCardAccent = {
  idle: string;
  active: string;
  iconIdle: string;
  iconActive: string;
};

export const workerFilterAccents: Record<WorkerFilter, FilterCardAccent> = {
  total: {
    idle: "border-sky-200/90 bg-gradient-to-br from-sky-50 to-white hover:border-sky-300 hover:shadow-sm",
    active:
      "border-sky-600 bg-gradient-to-br from-sky-600 to-sky-700 text-white shadow-md shadow-sky-900/15",
    iconIdle: "text-sky-600",
    iconActive: "text-white",
  },
  pending: {
    idle: "border-amber-200/90 bg-gradient-to-br from-amber-50 to-white hover:border-amber-300 hover:shadow-sm",
    active:
      "border-amber-600 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md shadow-amber-900/15",
    iconIdle: "text-amber-600",
    iconActive: "text-white",
  },
  overdue: {
    idle: "border-red-200/90 bg-gradient-to-br from-red-50 to-white hover:border-red-300 hover:shadow-sm",
    active:
      "border-red-600 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md shadow-red-900/15",
    iconIdle: "text-red-600",
    iconActive: "text-white",
  },
  awaiting_parts: {
    idle: "border-violet-200/90 bg-gradient-to-br from-violet-50 to-white hover:border-violet-300 hover:shadow-sm",
    active:
      "border-violet-600 bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-md shadow-violet-900/15",
    iconIdle: "text-violet-600",
    iconActive: "text-white",
  },
};

export type StatColor = "primary" | "secondary" | "success" | "warning" | "danger";
