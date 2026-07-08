import { format, parseISO } from "date-fns";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Package,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { TaskThumbnailCard } from "@/components/dashboard/TaskThumbnailCard";
import { useRepairs } from "@/context/RepairsContext";
import { getDepartmentInfo, getTeamProfileBySlug } from "@/data/teamProfiles";
import {
  activeTasksForWorker,
  analyticsForWorker,
  recentHistoryForWorker,
} from "@/lib/workerAnalytics";
import { isRepairOverdue } from "@/lib/taskFilters";
import { statusLabels } from "@/lib/repairLabels";
import { formatDate } from "@/lib/utils";

export function TeamMemberPage() {
  const { memberSlug } = useParams<{ memberSlug: string }>();
  const { repairs } = useRepairs();

  const member = memberSlug ? getTeamProfileBySlug(memberSlug) : undefined;
  if (!member) return <Navigate to="/team" replace />;

  const department = getDepartmentInfo(member.department);
  const analytics = analyticsForWorker(repairs, member.name);
  const allocatedTasks = activeTasksForWorker(repairs, member.name);
  const historyTasks = recentHistoryForWorker(repairs, member.name);

  return (
    <main className="flex-1 space-y-6 p-5 pb-10 sm:p-8 lg:p-10">
      <section className="rounded-[1.75rem] border border-primary/15 bg-primary px-6 py-7 text-primary-foreground sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
              {department?.label ?? "Team member"}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{member.name}</h1>
            <p className="mt-2 text-lg font-medium text-white/95">{member.role}</p>
            <p className="mt-1 text-base text-white/85">{member.workType}</p>
            <p className="mt-4 text-sm text-white/75">
              Joined {format(parseISO(member.joinedAt), "d MMM yyyy")} ·{" "}
              {member.buildings.join(" · ")}
            </p>
          </div>
          <Link
            to="/team"
            className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            ← Back to team
          </Link>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {member.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold text-white"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Active assignments"
            value={analytics.assignedActive}
            subtitle="Currently allocated"
            icon={ClipboardList}
            color="primary"
          />
          <StatCard
            title="Completed"
            value={analytics.completedClosedBy}
            subtitle="Closed by this worker"
            icon={CheckCircle2}
            color="success"
            delay={0.05}
          />
          <StatCard
            title="Past due"
            value={analytics.overdue}
            subtitle="Overdue on their queue"
            icon={Clock}
            color={analytics.overdue > 0 ? "danger" : "success"}
            delay={0.1}
          />
          <StatCard
            title="Awaiting stock"
            value={analytics.awaitingParts}
            subtitle="Waiting on parts"
            icon={Package}
            color="warning"
            delay={0.15}
          />
        </section>

        {analytics.byCategory.length > 0 && (
          <section className="rounded-[1.5rem] border border-border/70 bg-card p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Task analytics by type</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Complaint categories handled by {member.name}
            </p>
            <ul className="mt-5 space-y-3">
              {analytics.byCategory.map((row) => (
                <li key={row.category}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium">{row.label}</span>
                    <span className="tabular-nums text-muted-foreground">{row.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${(row.count / analytics.totalHandled) * 100}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MiniStat label="Pending" value={analytics.pending} />
              <MiniStat label="In progress" value={analytics.inProgress} />
              <MiniStat label="Total handled" value={analytics.totalHandled} />
            </div>
          </section>
        )}

        <section className="rounded-[1.5rem] border border-border/70 bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Assigned tasks</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {allocatedTasks.length} open assignment
                {allocatedTasks.length === 1 ? "" : "s"}
              </p>
            </div>
            <Link
              to={`/tasks?worker=${encodeURIComponent(member.name)}&filter=assigned`}
              className="text-sm font-semibold text-primary hover:underline"
            >
              View in tasks →
            </Link>
          </div>
          {allocatedTasks.length === 0 ? (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-sm text-muted-foreground">
              <AlertCircle className="h-5 w-5 shrink-0" />
              No currently assigned tasks.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {allocatedTasks.map((repair) => (
                <TaskThumbnailCard
                  key={repair.id}
                  repair={repair}
                  to={`/tasks/${repair.id}`}
                  hideImages
                  footer={
                    isRepairOverdue(repair)
                      ? "Past due"
                      : `${repair.building} · ${repair.unit}`
                  }
                />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[1.5rem] border border-border/70 bg-card p-5 sm:p-6">
          <h2 className="text-xl font-semibold">Recent task history</h2>
          {historyTasks.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No task history yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {historyTasks.map((repair) => (
                <TaskThumbnailCard
                  key={repair.id}
                  repair={repair}
                  to={`/tasks/${repair.id}`}
                  hideImages
                  compact
                  footer={`${statusLabels[repair.status]} · ${formatDate(repair.reportedAt)}`}
                />
              ))}
            </div>
          )}
        </section>
      </main>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
