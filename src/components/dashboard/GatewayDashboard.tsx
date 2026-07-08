import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Package,
  UserCheck,
  UserX,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { RequestsByDayPanel } from "@/components/dashboard/RequestsByDayPanel";
import { GlassStatCard } from "@/components/dashboard/GlassStatCard";
import { useAuth } from "@/context/AuthContext";
import { useRepairs } from "@/context/RepairsContext";
import {
  countByComplaintType,
  rankWorkersByClosed,
  rankWorkersByOpen,
} from "@/lib/dashboardMetrics";
import { images } from "@/lib/images";
import {
  matchesSupervisorTaskFilter,
  type SupervisorTaskFilter,
} from "@/lib/taskFilters";
import { cn } from "@/lib/utils";

export type DashboardFocus = "full" | "calendar";

interface GatewayDashboardProps {
  focus?: DashboardFocus;
}

const heroTaskCards: {
  filter: SupervisorTaskFilter;
  label: string;
  hint: string;
  icon: LucideIcon;
}[] = [
  {
    filter: "pending",
    label: "Open tasks",
    hint: "Pending & in progress",
    icon: ClipboardList,
  },
  {
    filter: "unassigned",
    label: "Unassigned",
    hint: "Needs a technician",
    icon: UserX,
  },
  {
    filter: "awaiting_stock",
    label: "Awaiting stock",
    hint: "Waiting on parts",
    icon: Package,
  },
  {
    filter: "past_due",
    label: "Past due",
    hint: "Overdue schedule or SLA",
    icon: Clock,
  },
  {
    filter: "assigned",
    label: "Assigned",
    hint: "With a technician",
    icon: UserCheck,
  },
  {
    filter: "completed",
    label: "Completed",
    hint: "Closed tasks",
    icon: CheckCircle2,
  },
];

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
  const problemTypes = useMemo(() => countByComplaintType(tasks), [tasks]);
  const topCloser = useMemo(() => rankWorkersByClosed(tasks)[0], [tasks]);
  const topBacklog = useMemo(() => rankWorkersByOpen(tasks)[0], [tasks]);

  const activeTasks = useMemo(
    () => tasks.filter((t) => t.status !== "cancelled"),
    [tasks]
  );

  const filterCounts = useMemo(
    () =>
      Object.fromEntries(
        heroTaskCards.map((card) => [
          card.filter,
          activeTasks.filter((task) => matchesSupervisorTaskFilter(task, card.filter))
            .length,
        ])
      ) as Record<SupervisorTaskFilter, number>,
    [activeTasks]
  );

  const maxProblemCount = Math.max(1, ...problemTypes.map((p) => p.count));

  return (
    <div className="space-y-8 p-5 pb-12 sm:p-8 lg:p-10">
      {(focus === "full" || focus === "calendar") && (
        <section className="relative min-h-[28rem] overflow-hidden rounded-[1.75rem] sm:min-h-[32rem]">
          <img
            src={images.building}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
          <div className="relative z-10 flex min-h-[28rem] flex-col justify-end p-6 sm:min-h-[32rem] sm:p-8">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              {greeting}, {firstName}
            </h1>
            <p className="mt-2 text-sm font-medium text-white/80 sm:text-base">
              Here&apos;s what needs attention across your properties today.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {heroTaskCards.map((card) => {
                const Icon = card.icon;
                const count = filterCounts[card.filter];
                return (
                  <GlassStatCard
                    key={card.filter}
                    tone="frosted"
                    icon={Icon}
                    label={card.label}
                    hint={card.hint}
                    value={String(count)}
                    to={`/tasks?filter=${card.filter}`}
                  />
                );
              })}
            </div>
            <Link
              to="/tasks"
              className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <AlertCircle className="h-4 w-4" />
              View all tasks
            </Link>
          </div>
        </section>
      )}

      <section
        id="worker-workload"
        className={cn(
          "grid gap-4 rounded-2xl border border-border/70 bg-card p-5 sm:grid-cols-2",
          focus !== "full" && "hidden"
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
            Largest backlog
          </p>
          <p className="mt-2 text-lg font-semibold">
            {topBacklog
              ? `${topBacklog.name} (${topBacklog.count} unclosed)`
              : "No open backlog"}
          </p>
        </Link>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
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
    </div>
  );
}
