import { useMemo, useState } from "react";
import { AlertTriangle, ClipboardList, UserCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  TeamMemberCard,
  workloadForActive,
  type WorkloadFilter,
} from "@/components/dashboard/TeamMemberCard";
import { teamProfiles } from "@/data/teamProfiles";
import { useRepairs } from "@/context/RepairsContext";
import { cn } from "@/lib/utils";

const filters: { id: WorkloadFilter; label: string }[] = [
  { id: "all", label: "All team" },
  { id: "available", label: "Available" },
  { id: "busy", label: "Busy" },
  { id: "capacity", label: "At capacity" },
];

export function TeamPage() {
  const { repairs } = useRepairs();
  const [filter, setFilter] = useState<WorkloadFilter>("all");

  const activeByAssignee = useMemo(() => {
    const map: Record<string, number> = {};
    for (const repair of repairs) {
      if (!repair.assignedTo || ["completed", "cancelled"].includes(repair.status)) continue;
      map[repair.assignedTo] = (map[repair.assignedTo] ?? 0) + 1;
    }
    return map;
  }, [repairs]);

  const membersWithWorkload = useMemo(
    () =>
      teamProfiles.map((member) => {
        const active = activeByAssignee[member.name] ?? 0;
        return { member, active, ...workloadForActive(active) };
      }),
    [activeByAssignee]
  );

  const filteredMembers = useMemo(() => {
    if (filter === "all") return membersWithWorkload;
    return membersWithWorkload.filter((entry) => entry.status === filter);
  }, [filter, membersWithWorkload]);

  const totalActive = membersWithWorkload.reduce((sum, entry) => sum + entry.active, 0);
  const atCapacity = membersWithWorkload.filter((entry) => entry.status === "capacity").length;
  const available = membersWithWorkload.filter((entry) => entry.status === "available").length;

  return (
    <>
      <PageHeader
        title="Team"
        description="Assign work confidently — see who is available, busy, or at capacity before allocating jobs."
      />
      <main className="flex-1 space-y-6 p-5 pb-10 sm:p-8 lg:p-10">
        <section className="rounded-[1.75rem] border border-primary/15 bg-primary px-6 py-7 text-primary-foreground sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
            People & workload
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Balance maintenance across your team
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-white/85">
            Open a profile to see allocated tasks, history, and inventory consumed. Workload is
            calculated live from current repair assignments.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Team members"
            value={teamProfiles.length}
            subtitle="Assignable staff & contractors"
            icon={Users}
            color="primary"
            delay={0}
          />
          <StatCard
            title="Active assignments"
            value={totalActive}
            subtitle="Open jobs across the team"
            icon={ClipboardList}
            color="secondary"
            delay={0.05}
          />
          <StatCard
            title="At capacity"
            value={atCapacity}
            subtitle="May need reassignment"
            icon={AlertTriangle}
            color={atCapacity > 0 ? "danger" : "success"}
            delay={0.1}
          />
          <StatCard
            title="Available now"
            value={available}
            subtitle="Ready for new work"
            icon={UserCheck}
            color="success"
            delay={0.15}
          />
        </section>

        <section className="rounded-[1.5rem] border border-border/70 bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Team directory</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredMembers.length} of {teamProfiles.length} shown
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
                    filter === item.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center">
              <p className="text-base font-medium">No team members match this filter</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try another workload view or reset to all team.
              </p>
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="mt-4 text-sm font-semibold text-primary hover:underline"
              >
                Show all team
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredMembers.map((entry, index) => (
                <TeamMemberCard
                  key={entry.member.slug}
                  member={entry.member}
                  active={entry.active}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
