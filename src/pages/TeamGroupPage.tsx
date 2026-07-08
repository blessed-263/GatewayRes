import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ClipboardList, UserCheck, Users } from "lucide-react";
import { poolAccentClass } from "@/components/team/TeamGroupCard";
import {
  TeamMemberCard,
  workloadForActive,
} from "@/components/dashboard/TeamMemberCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { TeamSectionHeader } from "@/components/dashboard/TeamSectionHeader";
import { useRepairs } from "@/context/RepairsContext";
import { complaintTypeOptions } from "@/lib/complaintTypes";
import {
  analyticsForPool,
  buildWorkPoolSections,
  groupMembersByWorkloadStatus,
  sortMembersByWorkload,
  teamGroupLabel,
  type TeamMemberWorkload,
} from "@/lib/teamPools";
import type { RepairCategory } from "@/types/repair";
import { teamProfiles } from "@/data/teamProfiles";

function isTeamCategory(value: string | undefined): value is RepairCategory {
  return complaintTypeOptions.some((pool) => pool.value === value);
}

export function TeamGroupPage() {
  const { category } = useParams<{ category: string }>();
  const { repairs } = useRepairs();

  if (!isTeamCategory(category)) {
    return <Navigate to="/team" replace />;
  }

  const poolMeta = complaintTypeOptions.find((pool) => pool.value === category)!;

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

  const section = useMemo(() => {
    const [pool] = buildWorkPoolSections(membersWithWorkload, category);
    return pool;
  }, [membersWithWorkload, category]);

  const analytics = useMemo(() => analyticsForPool(repairs, category), [repairs, category]);

  if (!section) {
    return <Navigate to="/team" replace />;
  }

  const teamLabel = teamGroupLabel(category, poolMeta.label);
  const accent = poolAccentClass(category);
  const busyCount = section.members.filter((entry) => entry.status === "busy").length;
  const atCapacity = section.members.filter((entry) => entry.status === "capacity").length;

  return (
    <main className="flex-1 space-y-6 p-5 pb-10 sm:p-8 lg:p-10">
      <div>
        <Link
          to="/team"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          All teams
        </Link>
      </div>

      <section className="rounded-[1.75rem] border border-primary/15 bg-primary px-6 py-7 text-primary-foreground sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground/75">
          Work pool
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{teamLabel}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-primary-foreground/85">
          {section.description}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Technicians"
          value={section.members.length}
          subtitle={`${section.availableCount} available now`}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Open jobs"
          value={analytics.openJobs}
          subtitle="In this category"
          icon={ClipboardList}
          color="warning"
          delay={0.05}
        />
        <StatCard
          title="Active load"
          value={section.totalActive}
          subtitle={
            busyCount || atCapacity
              ? `${busyCount} busy · ${atCapacity} at capacity`
              : "Assignments on the team"
          }
          icon={UserCheck}
          color="secondary"
          delay={0.1}
        />
        <StatCard
          title="Completed"
          value={analytics.completedJobs}
          subtitle="All time in category"
          icon={CheckCircle2}
          color="success"
          delay={0.15}
        />
      </section>

      <section className="rounded-[1.5rem] border border-border/70 bg-gradient-to-br from-card via-card to-muted/20 p-5 sm:p-6">
        <TeamSectionHeader
          category={category}
          label={teamLabel}
          description={section.description}
          memberCount={section.members.length}
          totalActive={section.totalActive}
          availableCount={section.availableCount}
          tasksLink={`/tasks?type=${category}`}
        />

        {section.members.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
            No technicians are assigned to this team yet.
          </p>
        ) : (
          <MemberGrid members={section.members} accentClassName={accent} />
        )}
      </section>
    </main>
  );
}

function MemberGrid({
  members,
  accentClassName,
}: {
  members: TeamMemberWorkload[];
  accentClassName: string;
}) {
  const sorted = sortMembersByWorkload(members);
  const buckets = groupMembersByWorkloadStatus(sorted);
  const useSubgroups = buckets.length > 1 && members.length > 2;

  if (!useSubgroups) {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((entry, index) => (
          <TeamMemberCard
            key={entry.member.slug}
            member={entry.member}
            active={entry.active}
            accentClassName={accentClassName}
            index={index}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {buckets.map((bucket) => (
        <div key={bucket.status}>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {bucket.label}
          </p>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {bucket.members.map((entry, index) => (
              <TeamMemberCard
                key={`${entry.member.slug}-${bucket.status}`}
                member={entry.member}
                active={entry.active}
                accentClassName={accentClassName}
                index={index}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
