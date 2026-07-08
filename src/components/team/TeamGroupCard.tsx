import { Link } from "react-router-dom";
import { ChevronRight, Users } from "lucide-react";
import {
  categoryIcons,
  categoryTileClass,
} from "@/lib/categoryVisuals";
import type { PoolAnalytics, WorkPoolSection } from "@/lib/teamPools";
import { cn } from "@/lib/utils";
import type { RepairCategory } from "@/types/repair";

interface TeamGroupCardProps {
  section: WorkPoolSection;
  teamLabel: string;
  analytics: PoolAnalytics;
  index?: number;
}

export function TeamGroupCard({
  section,
  teamLabel,
  analytics,
  index = 0,
}: TeamGroupCardProps) {
  const Icon = categoryIcons[section.category] ?? categoryIcons.other;
  const tileClass = categoryTileClass[section.category] ?? categoryTileClass.other;
  const busyCount = section.members.filter((entry) => entry.status === "busy").length;
  const atCapacity = section.members.filter((entry) => entry.status === "capacity").length;

  return (
    <Link
      to={`/team/group/${section.category}`}
      className="group block rounded-[1.5rem] border border-primary/15 bg-gradient-to-br from-primary/[0.04] via-card to-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-6"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ring-black/5",
            tileClass
          )}
        >
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>

      <h2 className="mt-4 text-xl font-semibold tracking-tight transition-colors group-hover:text-primary">
        {teamLabel}
      </h2>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{section.description}</p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <MiniStat label="Technicians" value={section.members.length} />
        <MiniStat label="Open jobs" value={analytics.openJobs} highlight />
        <MiniStat label="Available" value={section.availableCount} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-1">
          <Users className="h-3.5 w-3.5" />
          {section.totalActive} active assignments
        </span>
        {busyCount > 0 ? (
          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-amber-800 dark:text-amber-300">
            {busyCount} busy
          </span>
        ) : null}
        {atCapacity > 0 ? (
          <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-red-700 dark:text-red-400">
            {atCapacity} at capacity
          </span>
        ) : null}
        {analytics.completedJobs > 0 ? (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">
            {analytics.completedJobs} completed
          </span>
        ) : null}
      </div>
    </Link>
  );
}

function MiniStat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-white/80 px-3 py-2.5 text-center shadow-sm">
      <p
        className={cn(
          "text-lg font-bold tabular-nums",
          highlight ? "text-primary" : "text-foreground"
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

export function poolAccentClass(category: RepairCategory) {
  const accents: Partial<Record<RepairCategory, string>> = {
    plumbing: "from-[#4A6114]/80 to-[#4A6114]/40",
    electrical: "from-[#7FA324]/80 to-[#7FA324]/40",
    structural: "from-[#5A7318]/80 to-[#5A7318]/40",
    pest_control: "from-[#A8C932]/80 to-[#A8C932]/40",
    other: "from-[#bde639]/80 to-[#bde639]/40",
  };
  return accents[category] ?? "from-primary/80 to-primary/40";
}
