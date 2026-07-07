import { cn } from "@/lib/utils";
import { formatSlaDue } from "@/lib/sla";
import type { Repair } from "@/types/repair";

export function SlaBadge({ repair, className }: { repair: Repair; className?: string }) {
  if (!repair.slaResolveBy) return null;

  const breached = repair.slaBreached;
  const label = breached ? "SLA breached" : `Resolve by ${formatSlaDue(repair.slaResolveBy)}`;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-semibold",
        breached
          ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
          : "bg-muted text-muted-foreground",
        className
      )}
    >
      {label}
    </span>
  );
}
