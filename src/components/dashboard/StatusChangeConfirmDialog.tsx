import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { statusChangeConfirmMessage } from "@/lib/statusChangeConfirm";
import { statusLabels } from "@/lib/repairLabels";
import type { RepairStatus } from "@/types/repair";

interface StatusChangeConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from: RepairStatus;
  to: RepairStatus | null;
  jobTitle: string;
  loading?: boolean;
  onConfirm: () => void;
}

export function StatusChangeConfirmDialog({
  open,
  onOpenChange,
  from,
  to,
  jobTitle,
  loading = false,
  onConfirm,
}: StatusChangeConfirmDialogProps) {
  if (!to) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Confirm status change</DialogTitle>
          <p className="text-left text-sm text-muted-foreground leading-6">
            {statusChangeConfirmMessage(from, to, jobTitle)}
          </p>
        </DialogHeader>
        <div className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2 text-sm">
          <span className="text-muted-foreground">{statusLabels[from]}</span>
          <span className="mx-2 text-muted-foreground">→</span>
          <span className="font-semibold text-foreground">{statusLabels[to]}</span>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-xl"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Saving…" : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
