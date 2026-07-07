import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatColor = "primary" | "secondary" | "success" | "warning" | "danger";

const tileStyles: Record<StatColor, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary text-secondary-foreground",
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  danger: "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400",
};

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  color?: StatColor;
  delay?: number;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "primary",
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="min-h-36 rounded-[1.35rem] border-border/70 p-6 transition-shadow duration-300 hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {title}
            </p>
            <p className="font-heading text-4xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
            {subtitle ? (
              <p className="text-sm leading-6 text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          <span
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
              tileStyles[color]
            )}
          >
            <Icon className="h-6 w-6" strokeWidth={1.75} />
          </span>
        </div>
        {trend != null && trend !== 0 ? (
          <div className="mt-4 border-t border-border/50 pt-4">
            <span
              className={`text-sm font-semibold ${
                trend > 0 ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {trend > 0 ? "+" : "−"}
              {Math.abs(trend)}% vs last month
            </span>
          </div>
        ) : null}
      </Card>
    </motion.div>
  );
}
