import { Link } from "react-router-dom";
import { ChevronRight, Layers3 } from "lucide-react";
import {
  categoryBarClass,
  categoryIcons,
  categoryTileClass,
} from "@/lib/categoryVisuals";
import { cn } from "@/lib/utils";
import type { RepairCategory } from "@/types/repair";

export interface JobsByTypeItem {
  category: RepairCategory;
  label: string;
  count: number;
}

interface JobsByTypePanelProps {
  items: JobsByTypeItem[];
  className?: string;
}

export function JobsByTypePanel({ items, className }: JobsByTypePanelProps) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const maxCount = Math.max(1, ...items.map((item) => item.count));

  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.04] via-card to-card shadow-sm",
        className
      )}
    >
      <div className="border-b border-border/70 p-5 sm:p-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          <Layers3 className="h-3.5 w-3.5" />
          By category
        </div>
        <h2 className="mt-3 text-xl font-semibold tracking-tight">Maintenance jobs by type</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} active job{total === 1 ? "" : "s"} across {items.length} type
          {items.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="space-y-3 p-5 sm:p-6">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center">
            <p className="text-sm font-medium">No jobs by type yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              New kiosk submissions will appear here once logged.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const Icon = categoryIcons[item.category] ?? categoryIcons.other;
            const tileClass = categoryTileClass[item.category] ?? categoryTileClass.other;
            const barClass = categoryBarClass[item.category] ?? categoryBarClass.other;
            const share = Math.round((item.count / total) * 100);

            return (
              <Link
                key={item.category}
                to={`/tasks?type=${item.category}`}
                className="group block rounded-2xl border border-border/70 bg-white/90 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/5",
                      tileClass
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
                          {item.label}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {share}% of open workload
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-sm font-bold tabular-nums text-primary">
                          {item.count}
                        </span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted/80">
                      <div
                        className={cn("h-full rounded-full transition-all", barClass)}
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
