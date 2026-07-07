import { format, parseISO } from "date-fns";
import { categoryLabels, priorityLabels, statusLabels } from "@/lib/repairLabels";
import type { Repair, RepairCategory, RepairStatus } from "@/types/repair";

function escapeCsv(value: string | number | undefined | null) {
  if (value == null) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const repairHeaders = [
  "ID",
  "Title",
  "Unit",
  "Building",
  "Category",
  "Priority",
  "Status",
  "Reported By",
  "Reported Date",
  "Scheduled Date",
  "Assigned To",
  "Estimated Cost (ZAR)",
  "Actual Cost (ZAR)",
  "Days Open",
  "Description",
];

function repairToRow(r: Repair): string[] {
  const daysOpen =
    r.status === "completed"
      ? ""
      : Math.max(
          0,
          Math.floor(
            (Date.now() - new Date(r.reportedAt).getTime()) / 86400000
          )
        );
  return [
    r.id,
    r.title,
    r.unit,
    r.building,
    categoryLabels[r.category as RepairCategory] ?? r.category,
    priorityLabels[r.priority],
    statusLabels[r.status as RepairStatus] ?? r.status,
    r.reportedBy,
    format(parseISO(r.reportedAt), "yyyy-MM-dd HH:mm"),
    r.scheduledFor ?? "",
    r.assignedTo ?? "",
    r.estimated_cost != null ? String(r.estimated_cost) : "",
    r.actual_cost != null ? String(r.actual_cost) : "",
    String(daysOpen),
    r.description,
  ];
}

export function exportRepairsCsv(repairs: Repair[], label = "all") {
  const date = format(new Date(), "yyyy-MM-dd");
  downloadCsv(`gateway-repairs-${label}-${date}.csv`, [
    repairHeaders,
    ...repairs.map(repairToRow),
  ]);
}

export function exportRepairsIntervalCsv(
  repairs: Repair[],
  fromKey: string,
  toKey: string
) {
  const exported = format(new Date(), "yyyy-MM-dd");
  downloadCsv(`gateway-requests-${fromKey}-to-${toKey}.csv`, [
    ["Gateway maintenance requests"],
    ["From", fromKey],
    ["To", toKey],
    ["Exported", exported],
    ["Total", String(repairs.length)],
    [],
    repairHeaders,
    ...repairs.map(repairToRow),
  ]);
}

export function exportDailyAssignmentsCsv(repairs: Repair[], day: string) {
  const dayRepairs = repairs.filter((r) => r.scheduledFor === day);
  const byAssignee = dayRepairs.reduce<Record<string, Repair[]>>((acc, r) => {
    const key = r.assignedTo || "Unassigned";
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const rows: string[][] = [
    ["Gateway Daily Assignments"],
    ["Date", day],
    ["Exported", format(new Date(), "yyyy-MM-dd HH:mm")],
    [],
    ["Assignee", "Task ID", "Title", "Unit", "Building", "Priority", "Status", "Category"],
  ];

  for (const [assignee, tasks] of Object.entries(byAssignee).sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    for (const t of tasks) {
      rows.push([
        assignee,
        t.id,
        t.title,
        t.unit,
        t.building,
        priorityLabels[t.priority],
        statusLabels[t.status],
        categoryLabels[t.category],
      ]);
    }
  }

  if (dayRepairs.length === 0) {
    rows.push([], ["No tasks scheduled for this date"]);
  }

  downloadCsv(`gateway-daily-assignments-${day}.csv`, rows);
}

export function getRepairsForDay(repairs: Repair[], day: string) {
  return repairs.filter((r) => r.scheduledFor === day);
}

export function todayKey() {
  return format(new Date(), "yyyy-MM-dd");
}
