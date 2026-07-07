import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { daysOpen, formatDate } from "@/lib/utils";
import {
  categoryLabels,
  priorityBadgeVariant,
  priorityLabels,
  statusBadgeVariant,
  statusLabels,
} from "@/lib/repairLabels";
import { RepairMobileCards } from "@/components/dashboard/RepairMobileCards";
import { assignableMembers } from "@/data/teamMembers";
import { categoryIcons, categoryTileClass } from "@/lib/categoryVisuals";
import type { Building, Repair, RepairStatus } from "@/types/repair";

interface RepairsTableProps {
  id?: string;
  repairs: Repair[];
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: RepairStatus | "all";
  onStatusFilterChange: (value: RepairStatus | "all") => void;
  buildingFilter: Building | "all";
  onBuildingFilterChange: (value: Building | "all") => void;
  onStatusUpdate: (id: string, status: RepairStatus) => void;
  onAssign?: (id: string, assignedTo: string | undefined) => void;
  onSchedule?: (id: string, scheduledFor: string | undefined) => void;
}

export function RepairsTable({
  id,
  repairs,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  buildingFilter,
  onBuildingFilterChange,
  onStatusUpdate,
  onAssign,
  onSchedule,
}: RepairsTableProps) {
  const filtered = repairs.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.id.toLowerCase().includes(q) ||
      r.unit.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.building.toLowerCase().includes(q) ||
      r.reportedBy.toLowerCase().includes(q) ||
      r.assignedTo?.toLowerCase().includes(q) ||
      (!r.assignedTo && "unassigned".includes(q));
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesBuilding =
      buildingFilter === "all" || r.building === buildingFilter;
    return matchesSearch && matchesStatus && matchesBuilding;
  });

  return (
    <Card id={id} className="overflow-hidden border-border/70">
      <CardHeader className="flex flex-col gap-5 border-b border-border/70 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Repair Requests
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Search, assign, schedule, and update requests from one queue.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Search: ID, unit, title, assignee..."
            className="h-12 w-full rounded-xl border-l-4 border-l-primary text-base sm:w-72"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Select
            value={statusFilter}
            onValueChange={(v) =>
              onStatusFilterChange(v as RepairStatus | "all")
            }
          >
            <SelectTrigger className="h-12 w-full rounded-xl sm:w-[170px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {(
                [
                  "open",
                  "in_progress",
                  "awaiting_parts",
                  "completed",
                  "cancelled",
                ] as RepairStatus[]
              ).map((s) => (
                <SelectItem key={s} value={s}>
                  {statusLabels[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={buildingFilter}
            onValueChange={(v) =>
              onBuildingFilterChange(v as Building | "all")
            }
          >
            <SelectTrigger className="h-12 w-full rounded-xl sm:w-[190px]">
              <SelectValue placeholder="Building" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All buildings</SelectItem>
              <SelectItem value="Genesis">Genesis</SelectItem>
              <SelectItem value="Lascelles">Lascelles</SelectItem>
              <SelectItem value="Truman House">Truman House</SelectItem>
              <SelectItem value="Claim Street Main">Claim Street Main</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <RepairMobileCards
          repairs={filtered}
          onStatusUpdate={onStatusUpdate}
          onAssign={onAssign}
          onSchedule={onSchedule}
        />
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-4 py-4 font-semibold">Unit / Building</th>
                <th className="px-4 py-4 font-semibold">Issue</th>
                <th className="px-4 py-4 font-semibold">Category</th>
                <th className="px-4 py-4 font-semibold">Priority</th>
                <th className="px-4 py-4 font-semibold">Reported</th>
                <th className="px-4 py-4 font-semibold">Days</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-4 py-4 font-semibold">Scheduled</th>
                <th className="px-6 py-4 font-semibold">Assigned</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No repairs match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((repair) => {
                  const CategoryIcon =
                    categoryIcons[repair.category] ?? categoryIcons.other;
                  const tileClass =
                    categoryTileClass[repair.category] ?? categoryTileClass.other;
                  return (
                  <tr
                    key={repair.id}
                    className="border-b transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-5 font-mono text-xs font-medium">
                      <Link
                        to={`/tasks/${repair.id}`}
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        {repair.id}
                      </Link>
                      {(repair.attachmentCount ?? 0) > 0 && (
                        <span className="ml-1 block text-[10px] text-muted-foreground">
                          {repair.attachmentCount} file
                          {(repair.attachmentCount ?? 0) === 1 ? "" : "s"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-5">
                      <div className="font-medium">{repair.unit}</div>
                      <div className="text-xs text-muted-foreground">
                        {repair.building}
                      </div>
                    </td>
                    <td className="min-w-[280px] max-w-[380px] px-4 py-5">
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tileClass}`}
                        >
                          <CategoryIcon className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                        <div className="min-w-0">
                          <div className="text-base font-semibold">{repair.title}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {repair.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      {categoryLabels[repair.category]}
                    </td>
                    <td className="px-4 py-5">
                      <Badge variant={priorityBadgeVariant(repair.priority)}>
                        {priorityLabels[repair.priority]}
                      </Badge>
                    </td>
                    <td className="px-4 py-5 whitespace-nowrap">
                      <div>{formatDate(repair.reportedAt)}</div>
                      <div className="text-xs text-muted-foreground">
                        {repair.reportedBy}
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      {repair.status === "completed"
                        ? "-"
                        : `${daysOpen(repair.reportedAt)}d`}
                    </td>
                    <td className="px-4 py-5">
                      <Select
                        value={repair.status}
                        onValueChange={(v) =>
                          onStatusUpdate(repair.id, v as RepairStatus)
                        }
                      >
                        <SelectTrigger className="h-8 w-[130px] border-0 bg-transparent p-0 shadow-none focus:ring-0">
                          <Badge variant={statusBadgeVariant(repair.status)}>
                            {statusLabels[repair.status]}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            [
                              "open",
                              "in_progress",
                              "awaiting_parts",
                              "completed",
                              "cancelled",
                            ] as RepairStatus[]
                          ).map((s) => (
                            <SelectItem key={s} value={s}>
                              {statusLabels[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-5">
                      {onSchedule ? (
                        <input
                          type="date"
                          className="flex h-8 w-[130px] rounded-md border border-input bg-background px-2 text-xs"
                          value={repair.scheduledFor ?? ""}
                          onChange={(e) =>
                            onSchedule(
                              repair.id,
                              e.target.value || undefined
                            )
                          }
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {repair.scheduledFor ?? "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {onAssign ? (
                        <Select
                          value={repair.assignedTo ?? "Unassigned"}
                          onValueChange={(v) =>
                            onAssign(
                              repair.id,
                              v === "Unassigned" ? undefined : v
                            )
                          }
                        >
                          <SelectTrigger className="h-8 w-[180px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Unassigned">Unassigned</SelectItem>
                            {assignableMembers.map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-muted-foreground">
                          {repair.assignedTo ?? "Unassigned"}
                        </span>
                      )}
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <p className="border-t px-4 py-3 text-xs text-muted-foreground md:px-6">
          Showing {filtered.length} of {repairs.length} repairs
        </p>
      </CardContent>
    </Card>
  );
}
