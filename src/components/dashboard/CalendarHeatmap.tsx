import { format, isSameDay, isSameMonth } from "date-fns";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CalendarHeatmapProps {
  /** Ascending list of days to render, e.g. a full month or a rolling window. */
  days: Date[];
  /** Counts keyed by `yyyy-MM-dd`. */
  counts: Record<string, number>;
  /** When provided, each day cell becomes a link to this path. */
  linkForDay?: (dateKey: string, day: Date) => string;
  /** Month used to dim out-of-month days (defaults to no dimming). */
  focusMonth?: Date;
  showWeekdayLabels?: boolean;
  showLegend?: boolean;
  valueLabel?: string;
  valueFormatter?: (value: number) => string;
  className?: string;
}

const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

function intensityClass(count: number, max: number) {
  if (count <= 0) return "bg-muted/50 text-muted-foreground";
  const ratio = count / max;
  if (ratio >= 0.99) return "bg-primary text-primary-foreground";
  if (ratio >= 0.66) return "bg-primary/70 text-primary-foreground";
  if (ratio >= 0.33) return "bg-primary/40 text-foreground";
  return "bg-primary/20 text-foreground";
}

export function CalendarHeatmap({
  days,
  counts,
  linkForDay,
  focusMonth,
  showWeekdayLabels = true,
  showLegend = false,
  valueLabel = "maintenance jobs",
  valueFormatter,
  className,
}: CalendarHeatmapProps) {
  const max = Math.max(1, ...Object.values(counts));
  const leadingPad = days.length > 0 ? days[0].getDay() : 0;
  const today = new Date();

  const formatValue = (value: number) => (valueFormatter ? valueFormatter(value) : String(value));

  return (
    <div className={cn("space-y-1.5", className)}>
      {showWeekdayLabels && (
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-medium text-muted-foreground">
          {weekdayLabels.map((d, i) => (
            <div key={`${d}-${i}`}>{d}</div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: leadingPad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const count = counts[key] ?? 0;
          const dimmed = focusMonth ? !isSameMonth(day, focusMonth) : false;
          const isToday = isSameDay(day, today);
          const cellClass = cn(
            "flex aspect-square items-center justify-center rounded-md text-[10px] font-semibold transition-colors",
            intensityClass(count, max),
            dimmed && "opacity-30",
            isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background"
          );

          if (linkForDay) {
            return (
              <Link
                key={key}
                to={linkForDay(key, day)}
                className={cn(cellClass, "hover:brightness-95")}
                title={`${format(day, "d MMM")} · ${formatValue(count)} ${valueLabel}`}
              >
                {format(day, "d")}
              </Link>
            );
          }
          return (
            <div
              key={key}
              className={cellClass}
              title={`${format(day, "d MMM")} · ${formatValue(count)} ${valueLabel}`}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>
      {showLegend && (
        <div className="flex items-center justify-end gap-1.5 pt-1 text-[10px] text-muted-foreground">
          <span>Less</span>
          <span className="h-3 w-3 rounded-sm bg-muted/50" />
          <span className="h-3 w-3 rounded-sm bg-primary/20" />
          <span className="h-3 w-3 rounded-sm bg-primary/40" />
          <span className="h-3 w-3 rounded-sm bg-primary/70" />
          <span className="h-3 w-3 rounded-sm bg-primary" />
          <span>More</span>
        </div>
      )}
    </div>
  );
}
