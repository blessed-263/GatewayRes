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
import { JobsByTypePanel } from "@/components/dashboard/JobsByTypePanel";
import { GlassStatCard } from "@/components/dashboard/GlassStatCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { useAuth } from "@/context/AuthContext";
import { useRepairs } from "@/context/RepairsContext";
import {
  countByComplaintType,
  rankWorkersByClosed,
  rankWorkersByOpen,
} from "@/lib/dashboardMetrics";
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
  iconClassName: string;
}[] = [
  {
    filter: "pending",
    label: "Open jobs",
    hint: "Pending & in progress",
    icon: ClipboardList,
    iconClassName: "bg-sky-500",
  },
  {
    filter: "unassigned",
    label: "Unassigned",
    hint: "Needs a technician",
    icon: UserX,
    iconClassName: "bg-violet-500",
  },
  {
    filter: "awaiting_stock",
    label: "Awaiting stock",
    hint: "Waiting on parts",
    icon: Package,
    iconClassName: "bg-amber-500",
  },
  {
    filter: "past_due",
    label: "Past due",
    hint: "Overdue schedule or SLA",
    icon: Clock,
    iconClassName: "bg-red-500",
  },
  {
    filter: "assigned",
    label: "Assigned",
    hint: "With a technician",
    icon: UserCheck,
    iconClassName: "bg-primary",
  },
  {
    filter: "completed",
    label: "Completed",
    hint: "Closed jobs",
    icon: CheckCircle2,
    iconClassName: "bg-primary",
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
  const problemTypes = useMemo(
    () =>
      countByComplaintType(tasks)
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count),
    [tasks]
  );
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

  return (
    <div className="space-y-8 p-5 pb-12 sm:p-8 lg:p-10">
      {(focus === "full" || focus === "calendar") && (
        <section className="min-h-[28rem] overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary via-[#55B896] to-[#1F5F49] sm:min-h-[32rem]">
          <div className="flex min-h-[28rem] flex-col justify-end p-6 sm:min-h-[32rem] sm:p-8">
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
                    iconClassName={card.iconClassName}
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
              View all maintenance jobs
            </Link>
          </div>
        </section>
      )}

      <section
        id="worker-workload"
        className={cn(
          "grid gap-4 sm:grid-cols-2",
          focus !== "full" && "hidden"
        )}
      >
        <Link
          to={`/tasks?worker=${encodeURIComponent(topCloser?.name ?? "")}`}
          className="block"
        >
          <StatCard
            title="Most active"
            value={topCloser?.count ?? 0}
            subtitle={topCloser ? `${topCloser.name} · closed jobs` : "No completions yet"}
            icon={CheckCircle2}
            color="success"
          />
        </Link>
        <Link
          to={`/tasks?filter=pending`}
          className="block"
        >
          <StatCard
            title="Largest backlog"
            value={topBacklog?.count ?? 0}
            subtitle={topBacklog ? `${topBacklog.name} · unclosed jobs` : "No open backlog"}
            icon={Clock}
            color="warning"
          />
        </Link>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <RequestsByDayPanel
          id="requests-by-day"
          repairs={tasks}
          className={cn(focus !== "full" && focus !== "calendar" && "hidden")}
        />

        <JobsByTypePanel
          items={problemTypes}
          className={cn(focus !== "full" && "hidden")}
        />
      </section>
    </div>
  );
}
