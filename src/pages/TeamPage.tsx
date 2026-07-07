import { useMemo, useState } from "react";
import { AlertTriangle, ClipboardList, UserCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  TeamMemberCard,
  workloadForActive,
} from "@/components/dashboard/TeamMemberCard";
import {
  getDepartmentInfo,
  teamDepartments,
  teamProfiles,
  type TeamDepartment,
} from "@/data/teamProfiles";
import { useRepairs } from "@/context/RepairsContext";
import { cn } from "@/lib/utils";

type DepartmentFilter = "all" | TeamDepartment;

export function TeamPage() {
  const { repairs } = useRepairs();
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

  const membersWithWorkload = useMemo(
    () =>
      teamProfiles.map((member) => {
        const active = activeByAssignee[member.name] ?? 0;
        return { member, active, ...workloadForActive(active) };
      }),
    [activeByAssignee]
  );

  const departmentSections = useMemo(() => {
    const departments =
      department === "all"
        ? teamDepartments
        : teamDepartments.filter((dept) => dept.id === department);

    return departments
      .map((dept) => ({
        ...dept,
        members: membersWithWorkload.filter(
          (entry) => entry.member.department === dept.id
        ),
      }))
      .filter((section) => section.members.length > 0);
  }, [department, membersWithWorkload]);

  const visibleCount = departmentSections.reduce(
    (sum, section) => sum + section.members.length,
    0
  );

  const totalActive = membersWithWorkload.reduce((sum, entry) => sum + entry.active, 0);
  const atCapacity = membersWithWorkload.filter(
    (entry) => entry.status === "capacity"
  ).length;
  const available = membersWithWorkload.filter(
    (entry) => entry.status === "available"
  ).length;

  return (
    <>
      <PageHeader
        title="Team"
        description="Browse by department, open a profile, and review assigned tasks and worker analytics."
      />
      <main className="flex-1 space-y-6 p-5 pb-10 sm:p-8 lg:p-10">
        <section className="rounded-[1.75rem] border border-primary/15 bg-primary px-6 py-7 text-primary-foreground sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
            Departments & workload
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Your maintenance teams
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-white/85">
            Select a department, then open a team member to see profile details,
            live assignments, and task analytics.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Team members"
            value={teamProfiles.length}
            subtitle={`Across ${teamDepartments.length} departments`}
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

        <section className="flex gap-2 overflow-x-auto pb-1">
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
          {teamDepartments.map((dept) => (
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
            </button>
          ))}
        </section>

        {departmentSections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center">
            <p className="text-base font-medium">No team members in this department</p>
            <button
              type="button"
              onClick={() => setDepartment("all")}
              className="mt-4 text-sm font-semibold text-primary hover:underline"
            >
              Show all departments
            </button>
          </div>
        ) : (
          departmentSections.map((section) => (
            <section
              key={section.id}
              className="rounded-[1.5rem] border border-border/70 bg-card p-5 sm:p-6"
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold tracking-tight">{section.label}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {section.description} · {section.members.length} member
                  {section.members.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {section.members.map((entry, index) => (
                  <TeamMemberCard
                    key={entry.member.slug}
                    member={entry.member}
                    active={entry.active}
                    departmentLabel={getDepartmentInfo(entry.member.department)?.label}
                    index={index}
                  />
                ))}
              </div>
            </section>
          ))
        )}

        <p className="text-center text-sm text-muted-foreground">
          Showing {visibleCount} team member{visibleCount === 1 ? "" : "s"}
          {department !== "all"
            ? ` in ${getDepartmentInfo(department)?.label}`
            : ""}
        </p>
      </main>
    </>
  );
}
