import { useMemo } from "react";
import { TeamGroupCard } from "@/components/team/TeamGroupCard";
import { workloadForActive } from "@/components/dashboard/TeamMemberCard";
import { useRepairs } from "@/context/RepairsContext";
import { complaintTypeOptions } from "@/lib/complaintTypes";
import {
  analyticsForPool,
  buildWorkPoolSections,
  teamGroupLabel,
} from "@/lib/teamPools";
import { teamProfiles } from "@/data/teamProfiles";

export function TeamPage() {
  const { repairs } = useRepairs();

  const membersWithWorkload = useMemo(() => {
    const activeByAssignee: Record<string, number> = {};
    for (const repair of repairs) {
      if (!repair.assignedTo || ["completed", "cancelled"].includes(repair.status)) continue;
      activeByAssignee[repair.assignedTo] = (activeByAssignee[repair.assignedTo] ?? 0) + 1;
    }
    return teamProfiles.map((member) => {
      const active = activeByAssignee[member.name] ?? 0;
      return { member, active, ...workloadForActive(active) };
    });
  }, [repairs]);

  const poolSections = useMemo(
    () => buildWorkPoolSections(membersWithWorkload, "all").filter((section) => section.members.length > 0),
    [membersWithWorkload]
  );

  const poolAnalytics = useMemo(
    () =>
      Object.fromEntries(
        complaintTypeOptions.map((pool) => [
          pool.value,
          analyticsForPool(repairs, pool.value),
        ])
      ),
    [repairs]
  );

  return (
    <main className="flex-1 space-y-8 p-5 pb-10 sm:p-8 lg:p-10">
      <section className="rounded-[1.75rem] border border-primary/15 bg-primary px-6 py-7 text-primary-foreground sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Team</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-primary-foreground/85">
          Choose a maintenance team to see who is on it, who is available, and what is in their
          queue.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {poolSections.map((section, index) => {
          const poolMeta = complaintTypeOptions.find((pool) => pool.value === section.category);
          return (
            <TeamGroupCard
              key={section.category}
              section={section}
              teamLabel={teamGroupLabel(section.category, poolMeta?.label ?? section.label)}
              analytics={poolAnalytics[section.category]}
              index={index}
            />
          );
        })}
      </section>

      {poolSections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center">
          <p className="text-base font-medium">No teams configured yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Assignment pools will appear here once technicians are linked to work types.
          </p>
        </div>
      ) : null}
    </main>
  );
}
