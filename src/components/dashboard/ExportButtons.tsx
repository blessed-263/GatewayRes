import { Button } from "@/components/ui/button";
import {
  exportDailyAssignmentsCsv,
  exportRepairsCsv,
} from "@/lib/export";
import { cn } from "@/lib/utils";
import type { Repair } from "@/types/repair";

interface ExportButtonsProps {
  repairs: Repair[];
  /** When set, enables daily assignments export for this date (YYYY-MM-DD) */
  dailyDate?: string;
  /** Subset label for filename when exporting a filtered list */
  exportLabel?: string;
  className?: string;
  buttonClassName?: string;
  dailyButtonClassName?: string;
}

export function ExportButtons({
  repairs,
  dailyDate,
  exportLabel = "all",
  className,
  buttonClassName,
  dailyButtonClassName,
}: ExportButtonsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={buttonClassName}
        onClick={() => exportRepairsCsv(repairs, exportLabel)}
      >
        Export CSV
      </Button>
      {dailyDate ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className={cn(buttonClassName, dailyButtonClassName)}
          onClick={() => exportDailyAssignmentsCsv(repairs, dailyDate)}
        >
          Export daily sheet
        </Button>
      ) : null}
    </div>
  );
}
