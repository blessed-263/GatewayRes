import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface GlassStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
  tone?: "light" | "dark" | "frosted";
  iconClassName?: string;
  className?: string;
  to?: string;
  hint?: string;
}

export function GlassStatCard({
  icon: Icon,
  label,
  value,
  trend,
  tone = "light",
  iconClassName,
  className,
  to,
  hint,
}: GlassStatCardProps) {
  const isLight = tone === "light";
  const isFrosted = tone === "frosted";

  const frostedBody = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
            iconClassName ?? "bg-primary"
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        {to ? (
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
        ) : null}
      </div>
      <div>
        <p className="text-3xl font-semibold tabular-nums text-foreground">{value}</p>
        <p className="mt-1 text-sm font-medium text-foreground/90">{label}</p>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {trend && (
        <span
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trend.direction === "up" ? "text-primary" : "text-red-600"
          )}
        >
          {trend.direction === "up" ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {trend.value} from last month
        </span>
      )}
    </>
  );

  if (isFrosted) {
    const cardClass = cn(
      "flex flex-col gap-3 rounded-2xl border border-white/40 bg-white/85 p-4 shadow-lg shadow-black/10 backdrop-blur-md transition-all dark:border-white/10 dark:bg-card/85",
      to && "group hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/95 hover:shadow-xl hover:shadow-black/15",
      className
    );

    if (to) {
      return (
        <Link to={to} className={cardClass}>
          {frostedBody}
        </Link>
      );
    }

    return <div className={cardClass}>{frostedBody}</div>;
  }

  return (
    <div
      className={cn(
        isLight ? "glass-card" : "glass-card-dark",
        "flex flex-col gap-3 p-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            isLight ? "bg-white/25 text-white" : "bg-white/10 text-white"
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-[11px] font-medium",
              trend.direction === "up" ? "text-[#7BDCB5]" : "text-red-300"
            )}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-semibold tabular-nums text-white">
          {value}
        </p>
        <p className="mt-1 text-sm text-white/75">{label}</p>
      </div>
    </div>
  );
}
