import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RepairComments } from "@/components/dashboard/RepairComments";
import { StatusChangeConfirmDialog } from "@/components/dashboard/StatusChangeConfirmDialog";
import { TaskWorkTimer } from "@/components/dashboard/TaskWorkTimer";
import { useAuth } from "@/context/AuthContext";
import { useRepairs } from "@/context/RepairsContext";
import { complaintLabelForCategory } from "@/lib/complaintTypes";
import { canAccessRepair } from "@/lib/repairAccess";
import {
  statusBadgeVariant,
  statusLabels,
} from "@/lib/repairLabels";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Repair, RepairStatus } from "@/types/repair";

const statusOptions: { value: RepairStatus; label: string }[] = [
  { value: "open", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "awaiting_parts", label: "Awaiting Parts" },
  { value: "completed", label: "Completed" },
];

export function WorkerJobPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getRepairById, updateRepairStatus, addRepairComment } = useRepairs();

  const [repair, setRepair] = useState<Repair | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<RepairStatus | null>(null);

  useEffect(() => {
    if (!id) return;
    const r = getRepairById(id);
    if (!r || !user || !canAccessRepair(r, user)) {
      navigate("/my-jobs", { replace: true });
      return;
    }
    setRepair(r);
  }, [id, getRepairById, user, navigate]);

  useEffect(() => {
    if (!id) return;
    const r = getRepairById(id);
    if (r) setRepair(r);
  }, [id, getRepairById]);

  if (!repair || !user) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
        Loading job…
      </div>
    );
  }

  const job = repair;
  const workerName = user.assigneeName ?? user.name;

  function requestStatusChange(status: RepairStatus) {
    if (status === job.status) return;
    setPendingStatus(status);
    setConfirmOpen(true);
  }

  async function confirmStatusChange() {
    if (!pendingStatus) return;
    setSaving(true);
    try {
      await updateRepairStatus(job.id, pendingStatus, workerName);
      setRepair(getRepairById(job.id) ?? null);
      setConfirmOpen(false);
      setPendingStatus(null);
    } finally {
      setSaving(false);
    }
  }

  const floor =
    job.floor ??
    job.residentPhone?.replace(/^Floor\s+/i, "") ??
    "—";

  return (
    <div className="flex flex-1 flex-col pb-8">
      <header className="border-b border-border/70 px-4 py-4 sm:px-8">
        <Link
          to="/my-jobs"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← My Jobs
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold">{repair.title}</h1>
          <Badge variant={statusBadgeVariant(repair.status)} className="font-normal">
            {statusLabels[repair.status]}
          </Badge>
        </div>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{repair.id}</p>
      </header>

      <main className="space-y-6 px-4 py-6 sm:px-8">
        <section className="rounded-2xl border border-border/70 bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Job details
          </h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Building</dt>
              <dd className="font-medium">{repair.building}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Floor</dt>
              <dd className="font-medium">{floor}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Room</dt>
              <dd className="font-medium">{repair.unit}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Type</dt>
              <dd className="font-medium">{complaintLabelForCategory(repair.category)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Description</dt>
              <dd className="mt-1 font-medium">{repair.description}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Reported by</dt>
              <dd className="font-medium">{repair.reportedBy}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Reported</dt>
              <dd className="font-medium">{formatDate(repair.reportedAt)}</dd>
            </div>
            {repair.closedBy && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Closed by</dt>
                <dd className="font-medium">
                  {repair.closedBy}
                  {repair.completedAt ? ` · ${formatDate(repair.completedAt)}` : ""}
                </dd>
              </div>
            )}
          </dl>
        </section>

        <TaskWorkTimer repair={repair} />

        <section className="rounded-2xl border border-border/70 bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Status</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {statusOptions.map((opt) => {
              const selected = repair.status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={saving}
                  onClick={() => requestStatusChange(opt.value)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/70 hover:bg-muted/40"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border",
                      selected ? "border-primary bg-primary text-white" : "border-muted-foreground/40"
                    )}
                  >
                    {selected ? <Check className="h-3 w-3" /> : null}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Notes</h2>
          <RepairComments
            comments={repair.comments ?? []}
            defaultAuthor={user.name}
            highlightSupervisorNotes
            onAdd={async (author, body) => {
              const updated = await addRepairComment(repair.id, author, body);
              setRepair(updated);
            }}
          />
        </section>
      </main>

      <StatusChangeConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) setPendingStatus(null);
        }}
        from={repair.status}
        to={pendingStatus}
        jobTitle={repair.title}
        loading={saving}
        onConfirm={() => void confirmStatusChange()}
      />
    </div>
  );
}
