import { addHours, isPast, parseISO } from "date-fns";
import { slaByPriority } from "@/data/slaConfig";
import type { Repair, RepairStatus } from "@/types/repair";

const activeStatuses: RepairStatus[] = ["open", "in_progress", "awaiting_parts"];

export function applySlaToRepair(repair: Repair, reportedAt = repair.reportedAt): Repair {
  const targets = slaByPriority[repair.priority];
  const base = parseISO(reportedAt);
  const slaRespondBy = addHours(base, targets.respondHours).toISOString();
  const slaResolveBy = addHours(base, targets.resolveHours).toISOString();
  const breached =
    activeStatuses.includes(repair.status) &&
    (isPast(parseISO(slaRespondBy)) || isPast(parseISO(slaResolveBy)));

  return { ...repair, slaRespondBy, slaResolveBy, slaBreached: breached };
}

export function refreshSlaBreaches(repairs: Repair[]): Repair[] {
  return repairs.map((repair) => {
    if (!repair.slaRespondBy || !repair.slaResolveBy) {
      return applySlaToRepair(repair);
    }
    const breached =
      activeStatuses.includes(repair.status) &&
      (isPast(parseISO(repair.slaRespondBy)) || isPast(parseISO(repair.slaResolveBy)));
    return { ...repair, slaBreached: breached };
  });
}

export function slaBreachCount(repairs: Repair[]): number {
  return repairs.filter((r) => r.slaBreached && activeStatuses.includes(r.status)).length;
}

export function formatSlaDue(iso?: string): string {
  if (!iso) return "—";
  const date = parseISO(iso);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
