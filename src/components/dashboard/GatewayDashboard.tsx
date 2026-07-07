import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  ListTodo,
} from "lucide-react";
import { RequestsByDayPanel } from "@/components/dashboard/RequestsByDayPanel";
import { GlassStatCard } from "@/components/dashboard/GlassStatCard";
import { TaskThumbnailCard } from "@/components/dashboard/TaskThumbnailCard";
import { useAuth } from "@/context/AuthContext";
import { useRepairs } from "@/context/RepairsContext";
import {
  countByComplaintType,
  countKpis,
  rankWorkersByClosed,
  rankWorkersByOpen,
} from "@/lib/dashboardMetrics";
import { images } from "@/lib/images";
import { cn } from "@/lib/utils";

export type DashboardFocus = "full" | "calendar" | "team";

interface GatewayDashboardProps {
  focus?: DashboardFocus;
}

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function GatewayDashboard({ focus = "full" }: GatewayDashboardProps) {
  const { user } = useAuth();
  const { repairs: tasks } = useRepairs();

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const greeting = greetingForHour(new Date().getHours());
  const kpis = useMemo(() => countKpis(tasks), [tasks]);
  const problemTypes = useMemo(() => countByComplaintType(tasks), [tasks]);
  const topCloser = useMemo(() => rankWorkersByClosed(tasks)[0], [tasks]);
  const topBacklog = useMemo(() => rankWorkersByOpen(tasks)[0], [tasks]);

  const openTasks = tasks
    .filter((t) => t.status !== "completed" && t.status !== "cancelled")
    .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());

  const maxProblemCount = Math.max(1, ...problemTypes.map((p) => p.count));

  return (
    <div className="space-y-8 p-5 pb-12 sm:p-8 lg:p-10">
      {(focus === "full" || focus === "calendar" || focus === "team") && (
        <section className="relative min-h-[26rem] overflow-hidden rounded-[1.75rem] sm:min-h-[30rem]">
          <img
            src={images.building}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
          <div className="relative z-10 flex min-h-[26rem] flex-col justify-end p-6 sm:min-h-[30rem] sm:p-8">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              {greeting}, {firstName}
            </h1>
            <p className="mt-2 text-sm font-medium text-white/80 sm:text-base">
              Supervisor dashboard
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <GlassStatCard
                tone="frosted"
                icon={ListTodo}
                label="Total requests"
                value={String(kpis.total)}
                trend={{ value: "+12%", direction: "up" }}
              />
              <GlassStatCard
                tone="frosted"
                icon={AlertCircle}
                label="Needs attention"
                value={String(kpis.needsAttention)}
                trend={{ value: "+8%", direction: "up" }}
              />
              <GlassStatCard
                tone="frosted"
                icon={CheckCircle2}
                label="Completed"
                value={String(kpis.completed)}
                trend={{ value: "+18%", direction: "up" }}
              />
              <GlassStatCard
                tone="frosted"
                icon={ClipboardList}
                label="Overdue"
                value={String(kpis.overdue)}
                trend={{ value: "+6%", direction: "up" }}
              />
            </div>
          </div>
        </section>
      )}

      {focus === "full" && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {openTasks.slice(0, 8).map((task) => (
            <TaskThumbnailCard
              key={task.id}
              repair={task}
              to={`/tasks/${task.id}`}
              layout="tile"
              hideImages
            />
          ))}
        </section>
      )}

      <section
        id="worker-workload"
        className={cn(
          "grid gap-4 rounded-2xl border border-border/70 bg-card p-5 sm:grid-cols-2",
          focus !== "full" && focus !== "team" && "hidden"
        )}
      >
        <Link
          to={`/tasks?worker=${encodeURIComponent(topCloser?.name ?? "")}`}
          className="rounded-xl border border-border/60 bg-muted/20 p-4 transition-colors hover:bg-muted/40"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Most active
          </p>
          <p className="mt-2 text-lg font-semibold">
            {topCloser ? `${topCloser.name} (${topCloser.count} closed)` : "No completions yet"}
          </p>
        </Link>
        <Link
          to={`/tasks?filter=pending`}
          className="rounded-xl border border-border/60 bg-muted/20 p-4 transition-colors hover:bg-muted/40"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Most unclosed
          </p>
          <p className="mt-2 text-lg font-semibold">
            {topBacklog
              ? `${topBacklog.name} (${topBacklog.count} unclosed)`
              : "No open backlog"}
          </p>
        </Link>
      </section>

      <section
        className={cn(
          "grid gap-6 lg:grid-cols-2",
          focus === "team" && "hidden"
        )}
      >
        <RequestsByDayPanel
          id="requests-by-day"
          repairs={tasks}
          className={cn(focus !== "full" && focus !== "calendar" && "hidden")}
        />

        <div
          className={cn(
            "rounded-2xl border border-border/70 bg-card p-5",
            focus !== "full" && "hidden"
          )}
        >
          <h2 className="text-lg font-semibold">Problems by type</h2>
          <p className="mt-1 text-sm text-muted-foreground">Task counts by complaint category</p>
          <ul className="mt-6 space-y-4">
            {problemTypes.map((item) => (
              <li key={item.category}>
                <Link
                  to={`/tasks?type=${item.category}`}
                  className="group block"
                >
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium group-hover:text-primary">{item.label}</span>
                    <span className="tabular-nums text-muted-foreground">{item.count}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(item.count / maxProblemCount) * 100}%` }}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {focus === "full" && openTasks.length > 8 && (
        <div className="text-center">
          <Link to="/tasks" className="text-sm font-semibold text-primary hover:underline">
            View all tasks →
          </Link>
        </div>
      )}
    </div>
  );
}
