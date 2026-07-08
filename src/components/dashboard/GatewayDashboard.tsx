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
import { categoryBarClass } from "@/lib/categoryVisuals";
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
    iconClassName: "bg-emerald-500",
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
          "relative grid gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card p-5 sm:grid-cols-2",
          focus !== "full" && "hidden"
        )}
      >
        <img
          src={images.residence}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/93 via-white/90 to-white/94" />
        <Link
          to={`/tasks?worker=${encodeURIComponent(topCloser?.name ?? "")}`}
          className="relative z-10 rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/95 to-white/95 p-4 transition-all hover:border-emerald-300 hover:shadow-sm"
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
          className="relative z-10 rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/95 to-white/95 p-4 transition-all hover:border-amber-300 hover:shadow-sm"
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
          backgroundImage={images.hero}
          overlayClassName="from-[#eaf7f3]/94 via-white/90 to-white/94"
          className={cn(focus !== "full" && focus !== "calendar" && "hidden")}
        />

        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-primary/[0.04] via-card to-card p-5",
            focus !== "full" && "hidden"
          )}
        >
          <img
            src={images.maintenance}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/94 via-white/91 to-white/95" />
          <h2 className="relative z-10 text-lg font-semibold">Maintenance jobs by type</h2>
          <p className="relative z-10 mt-1 text-sm text-muted-foreground">Maintenance job counts by type</p>
          <ul className="relative z-10 mt-6 space-y-4">
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
                      className={cn(
                        "h-full rounded-full transition-all",
                        categoryBarClass[item.category] ?? categoryBarClass.other
                      )}
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
