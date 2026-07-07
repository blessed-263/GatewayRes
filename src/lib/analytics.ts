import { format, parseISO, startOfMonth } from "date-fns";
import type { PartRequest, Repair, RepairAttachment } from "@/types/repair";

export interface MaintenanceAnalytics {
  totalRepairs: number;
  totalAttachments: number;
  attachmentsByKind: Record<string, number>;
  uploadsByMonth: { month: string; count: number }[];
  totalPartRequests: number;
  partRequestsByStatus: Record<string, number>;
  pendingPartRequests: number;
  repairsAwaitingParts: number;
  recentPartRequests: (PartRequest & { repairTitle: string; unit: string })[];
  topRequestedParts: { name: string; count: number }[];
}

function allAttachments(repairs: Repair[]): RepairAttachment[] {
  return repairs.flatMap((r) => r.attachments ?? []);
}

function allPartRequests(repairs: Repair[]): PartRequest[] {
  return repairs.flatMap((r) => r.partRequests ?? []);
}

export function computeMaintenanceAnalytics(repairs: Repair[]): MaintenanceAnalytics {
  const attachments = allAttachments(repairs);
  const partRequests = allPartRequests(repairs);

  const attachmentsByKind: Record<string, number> = {};
  for (const a of attachments) {
    attachmentsByKind[a.kind] = (attachmentsByKind[a.kind] ?? 0) + 1;
  }

  const uploadsByMonthMap: Record<string, number> = {};
  for (const a of attachments) {
    const key = format(startOfMonth(parseISO(a.uploadedAt)), "MMM yyyy");
    uploadsByMonthMap[key] = (uploadsByMonthMap[key] ?? 0) + 1;
  }
  const uploadsByMonth = Object.entries(uploadsByMonthMap)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => {
      const da = new Date(a.month);
      const db = new Date(b.month);
      return da.getTime() - db.getTime();
    });

  const partRequestsByStatus: Record<string, number> = {
    pending: 0,
    ordered: 0,
    received: 0,
    cancelled: 0,
  };
  for (const p of partRequests) {
    partRequestsByStatus[p.status] = (partRequestsByStatus[p.status] ?? 0) + 1;
  }

  const partNameCounts: Record<string, number> = {};
  for (const p of partRequests) {
    const key = p.partName.trim();
    partNameCounts[key] = (partNameCounts[key] ?? 0) + p.quantity;
  }
  const topRequestedParts = Object.entries(partNameCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const repairById = new Map(repairs.map((r) => [r.id, r]));
  const recentPartRequests = [...partRequests]
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
    .slice(0, 8)
    .map((p) => {
      const repair = repairById.get(p.repairId);
      return {
        ...p,
        repairTitle: repair?.title ?? p.repairId,
        unit: repair ? `${repair.unit} · ${repair.building}` : "",
      };
    });

  return {
    totalRepairs: repairs.length,
    totalAttachments: attachments.length,
    attachmentsByKind,
    uploadsByMonth,
    totalPartRequests: partRequests.length,
    partRequestsByStatus,
    pendingPartRequests: partRequestsByStatus.pending ?? 0,
    repairsAwaitingParts: repairs.filter((r) => r.status === "awaiting_parts").length,
    recentPartRequests,
    topRequestedParts,
  };
}
