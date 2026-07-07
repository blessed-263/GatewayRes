import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
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
  className?: string;
}

export function GlassStatCard({
  icon: Icon,
  label,
  value,
  trend,
  tone = "light",
  className,
}: GlassStatCardProps) {
  const isLight = tone === "light";
  const isFrosted = tone === "frosted";

  if (isFrosted) {
    return (
      <div
        className={cn(
          "flex flex-col gap-3 rounded-2xl border border-white/40 bg-white/85 p-4 shadow-lg shadow-black/10 backdrop-blur-md dark:border-white/10 dark:bg-card/85",
          className
        )}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-3xl font-semibold tabular-nums text-foreground">
            {value}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.direction === "up" ? "text-emerald-600" : "text-red-600"
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
      </div>
    );
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
              trend.direction === "up" ? "text-emerald-300" : "text-red-300"
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
