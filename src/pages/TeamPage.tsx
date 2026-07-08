import { useMemo, useState } from "react";
import { AlertTriangle, ClipboardList, UserCheck, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  TeamMemberCard,
  workloadForActive,
} from "@/components/dashboard/TeamMemberCard";
import { TeamSectionHeader } from "@/components/dashboard/TeamSectionHeader";
import {
  getDepartmentInfo,
  teamDepartments,
  teamProfiles,
  type TeamDepartment,
} from "@/data/teamProfiles";
import { useRepairs } from "@/context/RepairsContext";
import { complaintTypeOptions } from "@/lib/complaintTypes";
import {
  buildWorkPoolSections,
  groupMembersByWorkloadStatus,
  sortMembersByWorkload,
  type TeamMemberWorkload,
} from "@/lib/teamPools";
import { cn } from "@/lib/utils";
import type { RepairCategory } from "@/types/repair";

type GroupMode = "pools" | "departments";
type PoolFilter = "all" | RepairCategory;
type DepartmentFilter = "all" | TeamDepartment;

const departmentAccentClass: Record<TeamDepartment, string> = {
  plumbing: "from-[#1a6b72]/80 to-[#1a6b72]/40",
  electrical: "from-[#2a9099]/80 to-[#2a9099]/40",
  general: "from-sky-500/80 to-sky-500/40",
  structural: "from-[#4b6a8a]/80 to-[#4b6a8a]/40",
  contractors: "from-amber-500/80 to-amber-500/40",
};

const poolAccentColors: Partial<Record<RepairCategory, string>> = {
  plumbing: "from-[#1a6b72]/80 to-[#1a6b72]/40",
  electrical: "from-[#2a9099]/80 to-[#2a9099]/40",
  structural: "from-[#4b6a8a]/80 to-[#4b6a8a]/40",
  pest_control: "from-[#5ba3ab]/80 to-[#5ba3ab]/40",
  other: "from-[#7a9daf]/80 to-[#7a9daf]/40",
};

function poolAccentClass(category: RepairCategory) {
  return poolAccentColors[category] ?? "from-primary/80 to-primary/40";
}

export function TeamPage() {
  const { repairs } = useRepairs();
  const [groupMode, setGroupMode] = useState<GroupMode>("pools");
  const [poolFilter, setPoolFilter] = useState<PoolFilter>("all");
  const [department, setDepartment] = useState<DepartmentFilter>("all");

  const activeByAssignee = useMemo(() => {
    const map: Record<string, number> = {};
    for (const repair of repairs) {
      if (!repair.assignedTo || ["completed", "cancelled"].includes(repair.status)) {
        continue;
      }
      map[repair.assignedTo] = (map[repair.assignedTo] ?? 0) + 1;
    }
    return map;
  }, [repairs]);

  const membersWithWorkload = useMemo<TeamMemberWorkload[]>(
    () =>
      teamProfiles.map((member) => {
        const active = activeByAssignee[member.name] ?? 0;
        return { member, active, ...workloadForActive(active) };
      }),
    [activeByAssignee]
  );

  const poolSections = useMemo(
    () => buildWorkPoolSections(membersWithWorkload, poolFilter),
    [membersWithWorkload, poolFilter]
  );

  const poolMemberCounts = useMemo(
    () =>
      Object.fromEntries(
        complaintTypeOptions.map((pool) => [
          pool.value,
          buildWorkPoolSections(membersWithWorkload, pool.value)[0]?.members.length ?? 0,
        ])
      ) as Record<RepairCategory, number>,
    [membersWithWorkload]
  );

  const departmentSections = useMemo(() => {
    const departments =
      department === "all"
        ? teamDepartments
        : teamDepartments.filter((dept) => dept.id === department);

    return departments
      .map((dept) => {
        const members = sortMembersByWorkload(
          membersWithWorkload.filter((entry) => entry.member.department === dept.id)
        );
        return {
          ...dept,
          members,
          totalActive: members.reduce((sum, entry) => sum + entry.active, 0),
          availableCount: members.filter((entry) => entry.status === "available").length,
        };
      })
      .filter((section) => section.members.length > 0);
  }, [department, membersWithWorkload]);

  const visibleSections = groupMode === "pools" ? poolSections : departmentSections;
  const visibleCount =
    groupMode === "pools"
      ? poolSections.reduce((sum, section) => sum + section.members.length, 0)
      : departmentSections.reduce((sum, section) => sum + section.members.length, 0);

  const totalActive = membersWithWorkload.reduce((sum, entry) => sum + entry.active, 0);
  const atCapacity = membersWithWorkload.filter((entry) => entry.status === "capacity").length;
  const available = membersWithWorkload.filter((entry) => entry.status === "available").length;

  return (
    <main className="flex-1 space-y-6 p-5 pb-10 sm:p-8 lg:p-10">
      <section className="rounded-[1.75rem] border border-primary/15 bg-primary px-6 py-7 text-primary-foreground sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Team</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/85">
          Grouped by assignment pool or department. Open a profile to review workload and job
          history.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Team members"
          value={teamProfiles.length}
          subtitle={`Across ${complaintTypeOptions.length} work pools`}
          icon={Users}
          color="primary"
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

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-fit rounded-full border border-border/70 bg-muted/30 p-1">
          <button
            type="button"
            onClick={() => setGroupMode("pools")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              groupMode === "pools"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Work pools
          </button>
          <button
            type="button"
            onClick={() => setGroupMode("departments")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              groupMode === "departments"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Departments
          </button>
        </div>
      </section>

      <section className="flex gap-2 overflow-x-auto pb-1">
        {groupMode === "pools" ? (
          <>
            <button
              type="button"
              onClick={() => setPoolFilter("all")}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                poolFilter === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/70 bg-card text-muted-foreground hover:bg-muted/40"
              )}
            >
              All pools
            </button>
            {complaintTypeOptions.map((pool) => (
                <button
                  key={pool.value}
                  type="button"
                  onClick={() => setPoolFilter(pool.value)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    poolFilter === pool.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/70 bg-card text-muted-foreground hover:bg-muted/40"
                  )}
                >
                  {pool.label}
                  <span
                    className={cn(
                      "ml-2 tabular-nums",
                      poolFilter === pool.value ? "text-white/85" : ""
                    )}
                  >
                    {poolMemberCounts[pool.value]}
                  </span>
                </button>
              ))}
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setDepartment("all")}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                department === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/70 bg-card text-muted-foreground hover:bg-muted/40"
              )}
            >
              All departments
            </button>
            {teamDepartments.map((dept) => {
              const count = membersWithWorkload.filter(
                (entry) => entry.member.department === dept.id
              ).length;
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => setDepartment(dept.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    department === dept.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/70 bg-card text-muted-foreground hover:bg-muted/40"
                  )}
                >
                  {dept.label}
                  <span
                    className={cn(
                      "ml-2 tabular-nums",
                      department === dept.id ? "text-white/85" : ""
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </>
        )}
      </section>

      {visibleSections.length === 0 ||
      (groupMode === "pools"
        ? poolSections.every((section) => section.members.length === 0)
        : departmentSections.length === 0) ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center">
          <p className="text-base font-medium">No team members in this group</p>
          <button
            type="button"
            onClick={() => {
              setPoolFilter("all");
              setDepartment("all");
            }}
            className="mt-4 text-sm font-semibold text-primary hover:underline"
          >
            Show all
          </button>
        </div>
      ) : groupMode === "pools" ? (
        poolSections.map((section) => (
          <section
            key={section.category}
            className="rounded-[1.5rem] border border-border/70 bg-gradient-to-br from-card via-card to-muted/20 p-5 sm:p-6"
          >
            <TeamSectionHeader
              category={section.category}
              label={section.label}
              description={section.description}
              memberCount={section.members.length}
              totalActive={section.totalActive}
              availableCount={section.availableCount}
              tasksLink={`/tasks?type=${section.category}`}
            />

            {section.members.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                No workers assigned to this pool yet.
              </p>
            ) : (
              <MemberGrid
                members={section.members}
                accentClassName={poolAccentClass(section.category)}
                showDepartment
              />
            )}
          </section>
        ))
      ) : (
        departmentSections.map((section) => (
          <section
            key={section.id}
            className="rounded-[1.5rem] border border-border/70 bg-gradient-to-br from-card via-card to-muted/20 p-5 sm:p-6"
          >
            <div className="mb-6">
              <div className={cn("mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r", departmentAccentClass[section.id])} />
              <h2 className="text-xl font-semibold tracking-tight">{section.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {section.description} · {section.members.length} member
                {section.members.length === 1 ? "" : "s"} · {section.totalActive} active ·{" "}
                {section.availableCount} available
              </p>
            </div>
            <MemberGrid
              members={section.members}
              accentClassName={departmentAccentClass[section.id]}
            />
          </section>
        ))
      )}

      <p className="text-center text-sm text-muted-foreground">
        Showing {visibleCount} listing{visibleCount === 1 ? "" : "s"}
        {groupMode === "pools" && poolFilter !== "all"
          ? ` in ${complaintTypeOptions.find((pool) => pool.value === poolFilter)?.label}`
          : groupMode === "departments" && department !== "all"
            ? ` in ${getDepartmentInfo(department)?.label}`
            : ""}
      </p>
    </main>
  );
}

function MemberGrid({
  members,
  accentClassName,
  showDepartment = false,
}: {
  members: TeamMemberWorkload[];
  accentClassName: string;
  showDepartment?: boolean;
}) {
  const buckets = groupMembersByWorkloadStatus(members);
  const useSubgroups = buckets.length > 1 && members.length > 2;

  if (!useSubgroups) {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {members.map((entry, index) => (
          <TeamMemberCard
            key={`${entry.member.slug}-${index}`}
            member={entry.member}
            active={entry.active}
            departmentLabel={
              showDepartment ? getDepartmentInfo(entry.member.department)?.label : undefined
            }
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
                departmentLabel={
                  showDepartment ? getDepartmentInfo(entry.member.department)?.label : undefined
                }
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
