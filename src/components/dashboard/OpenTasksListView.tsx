import { useMemo, useState } from "react";
import { TaskThumbnailCard } from "@/components/dashboard/TaskThumbnailCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRepairs } from "@/context/RepairsContext";
import { buildingNames } from "@/data/propertyMaster";
import { statusLabels } from "@/lib/repairLabels";
import type { Building, RepairStatus } from "@/types/repair";

interface OpenTasksListViewProps {
  initialStatusFilter?: RepairStatus | "all";
}

export function OpenTasksListView({ initialStatusFilter = "open" }: OpenTasksListViewProps) {
  const { repairs } = useRepairs();
  const [search, setSearch] = useState("");
  const [buildingFilter, setBuildingFilter] = useState<Building | "all">("all");
  const [statusFilter, setStatusFilter] = useState<RepairStatus | "all">(initialStatusFilter);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return repairs.filter((repair) => {
      const matchesStatus = statusFilter === "all" || repair.status === statusFilter;
      const matchesBuilding =
        buildingFilter === "all" || repair.building === buildingFilter;
      const matchesSearch =
        !query ||
        repair.id.toLowerCase().includes(query) ||
        repair.title.toLowerCase().includes(query) ||
        repair.unit.toLowerCase().includes(query) ||
        repair.building.toLowerCase().includes(query);
      return matchesStatus && matchesBuilding && matchesSearch;
    });
  }, [repairs, search, buildingFilter, statusFilter]);

  return (
    <section className="rounded-[1.5rem] border border-border/70 bg-card p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">
          Maintenance Jobs ({filteredTasks.length})
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Search maintenance jobs..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 w-full sm:w-64"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as RepairStatus | "all")}
          >
            <SelectTrigger className="h-11 w-full sm:w-52">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {(["open", "in_progress", "awaiting_parts", "completed", "cancelled"] as const).map(
                (status) => (
                  <SelectItem key={status} value={status}>
                    {statusLabels[status]}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <Select
            value={buildingFilter}
            onValueChange={(value) => setBuildingFilter(value as Building | "all")}
          >
            <SelectTrigger className="h-11 w-full sm:w-56">
              <SelectValue placeholder="Building" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All buildings</SelectItem>
              {buildingNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <p className="rounded-xl border border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
          No maintenance jobs match your filters.
        </p>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((repair) => (
            <TaskThumbnailCard
              key={repair.id}
              repair={repair}
              to={`/tasks/${repair.id}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
