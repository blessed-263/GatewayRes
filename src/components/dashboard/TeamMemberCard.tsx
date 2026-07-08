import { format, parseISO } from "date-fns";
import { ArrowRight, Building2, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TeamProfile } from "@/data/teamProfiles";

const MAX_WORKLOAD = 5;

export type WorkloadFilter = "all" | "available" | "busy" | "capacity";

export function workloadForActive(active: number) {
  const pct = Math.min(100, Math.round((active / MAX_WORKLOAD) * 100));
  const status: WorkloadFilter =
    active >= MAX_WORKLOAD ? "capacity" : active >= 3 ? "busy" : "available";
  const label = status === "capacity" ? "At capacity" : status === "busy" ? "Busy" : "Available";
  return { pct, status, label };
}

interface TeamMemberCardProps {
  member: TeamProfile;
  active: number;
  departmentLabel?: string;
  index?: number;
  accentClassName?: string;
}

const accentBars = [
  "from-primary/80 to-primary/40",
  "from-sky-500/80 to-sky-500/40",
  "from-amber-500/80 to-amber-500/40",
  "from-violet-500/80 to-violet-500/40",
  "from-[#7BDCB5]/80 to-[#7BDCB5]/40",
  "from-rose-500/80 to-rose-500/40",
];

export function TeamMemberCard({
  member,
  active,
  departmentLabel,
  index = 0,
  accentClassName,
}: TeamMemberCardProps) {
  const { pct, status, label } = workloadForActive(active);
  const accent = accentClassName ?? accentBars[index % accentBars.length];

  const statusStyles = {
    available: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-[#7BDCB5]",
    busy: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400",
    capacity: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
  } as const;

  const barStyles = {
    available: "bg-primary",
    busy: "bg-amber-500",
    capacity: "bg-red-500",
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Link
        to={`/team/${member.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border/70 bg-gradient-to-br from-card via-card to-muted/25 shadow-sm shadow-black/[0.03] transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className={cn("h-2 bg-gradient-to-r", accent)} />

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <Avatar className="h-14 w-14 shrink-0 rounded-2xl border-2 border-background shadow-sm">
                <AvatarFallback className="rounded-2xl bg-primary/10 text-lg font-bold text-primary">
                  {member.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="text-xl font-semibold tracking-tight group-hover:text-primary">
                  {member.name}
                </h3>
                {departmentLabel ? (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary/80">
                    {departmentLabel}
                  </p>
                ) : null}
                <p className="mt-0.5 text-sm font-medium text-foreground/80">{member.role}</p>
                <p className="mt-1 text-sm text-muted-foreground">{member.workType}</p>
              </div>
            </div>
            <Badge className={cn("shrink-0 border-0 text-[11px] font-semibold", statusStyles[status])}>
              {label}
            </Badge>
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 shrink-0 text-primary/70" />
            <span className="line-clamp-1">{member.buildings.join(" · ")}</span>
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            Joined {format(parseISO(member.joinedAt), "dd MMM yyyy")}
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {member.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="outline" className="rounded-lg text-[11px] font-medium">
                {skill}
              </Badge>
            ))}
            {member.skills.length > 3 ? (
              <Badge variant="secondary" className="rounded-lg text-[11px]">
                +{member.skills.length - 3}
              </Badge>
            ) : null}
          </div>

          <div className="mt-5 rounded-xl bg-muted/30 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Active workload</span>
              <span className="font-semibold tabular-nums">
                {active} / {MAX_WORKLOAD}
              </span>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", barStyles[status])}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4 text-sm font-semibold text-primary">
            <span>View profile & jobs</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
