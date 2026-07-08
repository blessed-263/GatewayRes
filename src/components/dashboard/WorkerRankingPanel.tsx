import { Link } from "react-router-dom";
import { AlertTriangle, ChevronRight, Trophy, UserCheck } from "lucide-react";
import { getTeamProfileByName } from "@/data/teamProfiles";
import { cn } from "@/lib/utils";

export interface WorkerRankingItem {
  name: string;
  count: number;
}

type WorkerRankingVariant = "completed" | "backlog";

interface WorkerRankingPanelProps {
  variant: WorkerRankingVariant;
  items: WorkerRankingItem[];
  maxRows?: number;
  className?: string;
}

const variantConfig: Record<
  WorkerRankingVariant,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyBody: string;
    countLabel: string;
    icon: typeof UserCheck;
    shell: string;
    badge: string;
    bar: string;
    pill: string;
    avatar: string;
    link: (name: string) => string;
  }
> = {
  completed: {
    eyebrow: "Productivity",
    title: "Most active workers",
    subtitle: "Ranked by completed jobs (closed by)",
    emptyTitle: "No completions yet",
    emptyBody: "Closed jobs will surface your most active technicians here.",
    countLabel: "closed",
    icon: Trophy,
    shell:
      "border-primary/15 bg-gradient-to-br from-primary/[0.05] via-card to-card",
    badge: "border-primary/20 bg-primary/5 text-primary",
    bar: "bg-primary",
    pill: "bg-primary/10 text-primary",
    avatar: "bg-primary/10 text-primary ring-primary/15",
    link: (name) => `/tasks?worker=${encodeURIComponent(name)}`,
  },
  backlog: {
    eyebrow: "Workload",
    title: "Largest open backlogs",
    subtitle: "Unclosed jobs still assigned per technician",
    emptyTitle: "No open assignments",
    emptyBody: "When jobs are assigned but not closed, backlogs will show here.",
    countLabel: "unclosed",
    icon: AlertTriangle,
    shell:
      "border-amber-500/20 bg-gradient-to-br from-amber-500/[0.06] via-card to-card",
    badge: "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300",
    bar: "bg-amber-500",
    pill: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
    avatar: "bg-amber-500/10 text-amber-800 ring-amber-500/20 dark:text-amber-300",
    link: (name) =>
      `/tasks?worker=${encodeURIComponent(name)}&filter=assigned`,
  },
};

function workerInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function rankTone(index: number) {
  if (index === 0) return "bg-primary text-primary-foreground shadow-sm shadow-primary/20";
  if (index === 1) return "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100";
  if (index === 2) return "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300";
  return "bg-muted text-muted-foreground";
}

export function WorkerRankingPanel({
  variant,
  items,
  maxRows = 8,
  className,
}: WorkerRankingPanelProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const visible = items.slice(0, maxRows);
  const maxCount = Math.max(1, ...visible.map((item) => item.count));
  const totalJobs = visible.reduce((sum, item) => sum + item.count, 0);
  const leader = visible[0];

  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border shadow-sm",
        config.shell,
        className
      )}
    >
      <div className="border-b border-border/70 p-5 sm:p-6">
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]",
            config.badge
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {config.eyebrow}
        </div>
        <h2 className="mt-3 text-xl font-semibold tracking-tight">{config.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{config.subtitle}</p>

        {leader ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-white/80 px-4 py-3 shadow-sm">
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                rankTone(0)
              )}
            >
              1
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{leader.name}</p>
              <p className="text-xs text-muted-foreground">
                Leading with {leader.count} {config.countLabel} job
                {leader.count === 1 ? "" : "s"}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-sm font-bold tabular-nums",
                config.pill
              )}
            >
              {leader.count}
            </span>
          </div>
        ) : null}
      </div>

      <div className="space-y-3 p-5 sm:p-6">
        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center">
            <UserCheck className="mx-auto h-8 w-8 text-muted-foreground/60" strokeWidth={1.5} />
            <p className="mt-3 text-sm font-medium">{config.emptyTitle}</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
              {config.emptyBody}
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-xs font-medium text-muted-foreground">
              {visible.length} technician{visible.length === 1 ? "" : "s"} · {totalJobs}{" "}
              {config.countLabel} job{totalJobs === 1 ? "" : "s"} total
            </div>

            {visible.map((item, index) => {
              const profile = getTeamProfileByName(item.name);
              const share = Math.round((item.count / totalJobs) * 100);

              return (
                <Link
                  key={item.name}
                  to={profile ? `/team/${profile.slug}` : config.link(item.name)}
                  className="group block rounded-2xl border border-border/70 bg-white/90 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        rankTone(index)
                      )}
                    >
                      {index + 1}
                    </span>

                    <span
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ring-1 ring-black/5",
                        config.avatar
                      )}
                    >
                      {workerInitials(item.name)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
                            {item.name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {share}% of {variant === "completed" ? "closures" : "open load"}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-1 text-sm font-bold tabular-nums",
                              config.pill
                            )}
                          >
                            {item.count}
                          </span>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                            <ChevronRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted/80">
                        <div
                          className={cn("h-full rounded-full transition-all", config.bar)}
                          style={{ width: `${(item.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </div>
    </section>
  );
}
