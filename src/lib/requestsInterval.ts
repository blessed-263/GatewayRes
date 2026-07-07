import {
  endOfDay,
  format,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import type { Repair } from "@/types/repair";

export type IntervalPreset = "7" | "30" | "90" | "custom";

export const intervalPresets: { id: IntervalPreset; label: string }[] = [
  { id: "7", label: "Last 7 days" },
  { id: "30", label: "Last 30 days" },
  { id: "90", label: "Last 90 days" },
  { id: "custom", label: "Custom" },
];

export function boundsForInterval(
  preset: IntervalPreset,
  customFrom?: string,
  customTo?: string
): { start: Date; end: Date } {
  const end = endOfDay(new Date());

  if (preset === "custom" && customFrom && customTo) {
    const start = startOfDay(parseISO(customFrom));
    const customEnd = endOfDay(parseISO(customTo));
    return start <= customEnd ? { start, end: customEnd } : { start: customEnd, end: start };
  }

  const windowDays = preset === "7" ? 7 : preset === "90" ? 90 : 30;
  return {
    start: startOfDay(subDays(end, windowDays - 1)),
    end,
  };
}

export function intervalLabel(
  preset: IntervalPreset,
  start: Date,
  end: Date
): string {
  if (preset === "custom") {
    return `${format(start, "d MMM yyyy")} – ${format(end, "d MMM yyyy")}`;
  }
  return `${format(start, "d MMM")} – ${format(end, "d MMM yyyy")}`;
}

export function repairsReportedInInterval(
  repairs: Repair[],
  start: Date,
  end: Date
): Repair[] {
  return repairs
    .filter((repair) => {
      if (repair.status === "cancelled") return false;
      const reported = parseISO(repair.reportedAt);
      return reported >= start && reported <= end;
    })
    .sort(
      (a, b) =>
        new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    );
}

export function groupRepairsByReportDay(repairs: Repair[]) {
  const groups = new Map<string, Repair[]>();

  for (const repair of repairs) {
    const key = format(parseISO(repair.reportedAt), "yyyy-MM-dd");
    const list = groups.get(key) ?? [];
    list.push(repair);
    groups.set(key, list);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateKey, tasks]) => ({
      dateKey,
      label: format(parseISO(dateKey), "EEEE, d MMMM yyyy"),
      tasks,
    }));
}

export function defaultCustomFrom(preset: IntervalPreset): string {
  const { start } = boundsForInterval(preset === "custom" ? "30" : preset);
  return format(start, "yyyy-MM-dd");
}

export function defaultCustomTo(): string {
  return format(new Date(), "yyyy-MM-dd");
}
