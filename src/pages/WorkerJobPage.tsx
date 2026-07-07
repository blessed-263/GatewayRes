import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RepairAttachments } from "@/components/dashboard/RepairAttachments";
import { RepairComments } from "@/components/dashboard/RepairComments";
import { RepairPartRequests } from "@/components/dashboard/RepairPartRequests";
import { useAuth } from "@/context/AuthContext";
import { useRepairs } from "@/context/RepairsContext";
import { categoryIcons, categoryTileClass } from "@/lib/categoryVisuals";
import { canAccessRepair } from "@/lib/repairAccess";
import {
  statusBadgeVariant,
  statusLabels,
} from "@/lib/repairLabels";
import { formatDate } from "@/lib/utils";
import { images } from "@/lib/images";
import type { AttachmentKind, Repair, RepairStatus } from "@/types/repair";

export function WorkerJobPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getRepairById,
    updateRepairStatus,
    uploadRepairFiles,
    removeRepairAttachment,
    addRepairComment,
    addPartRequest,
    updateRepair,
  } = useRepairs();

  const [repair, setRepair] = useState<Repair | null>(null);
  const [saving, setSaving] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);

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

  async function setStatus(status: RepairStatus) {
    setSaving(true);
    try {
      await updateRepairStatus(repair!.id, status, user!.name);
      setRepair(getRepairById(repair!.id) ?? null);
    } finally {
      setSaving(false);
    }
  }

  async function upload(files: File[], kind: AttachmentKind) {
    setSaving(true);
    try {
      const updated = await uploadRepairFiles(repair!.id, files, kind, user!.name);
      setRepair(updated);
    } finally {
      setSaving(false);
    }
  }

  const isDone = repair.status === "completed" || repair.status === "cancelled";
  const CategoryIcon = categoryIcons[repair.category] ?? categoryIcons.other;
  const tileClass = categoryTileClass[repair.category] ?? categoryTileClass.other;

  return (
    <div className="flex flex-1 flex-col pb-6">
      <div className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={images.maintenance}
            alt=""
            className="h-40 w-full object-cover sm:h-48"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <p className="truncate font-heading text-lg font-semibold text-white sm:text-xl">
              {repair.title}
            </p>
            <p className="mt-0.5 text-sm text-white/80">
              {repair.unit} · {repair.building}
            </p>
          </div>
        </div>
      </div>

      <header className="px-4 pt-3">
        <Link
          to="/my-jobs"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← My Jobs
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-md ${tileClass}`}
          >
            <CategoryIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">{repair.id}</span>
          <Badge variant={statusBadgeVariant(repair.status)} className="font-normal">
            {statusLabels[repair.status]}
          </Badge>
        </div>
      </header>

      <main className="space-y-4 px-4 pt-4">
        <section className="elevated-card p-4">
          <h2 className="text-sm font-semibold">Issue</h2>
          <p className="mt-2 text-sm text-muted-foreground">{repair.description}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            Reported by {repair.reportedBy} · {formatDate(repair.reportedAt)}
          </p>
          {repair.residentPhone && (
            <a
              href={`tel:${repair.residentPhone}`}
              className="mt-2 inline-block text-sm font-medium text-primary"
            >
              Call {repair.residentPhone}
            </a>
          )}
        </section>

        {!isDone && (
          <section className="grid grid-cols-2 gap-2">
            {repair.status === "open" && (
              <Button
                className="min-h-12 col-span-2"
                disabled={saving}
                onClick={() => void setStatus("in_progress")}
              >
                Start job
              </Button>
            )}
            {repair.status === "in_progress" && (
              <>
                <Button
                  variant="outline"
                  className="min-h-12"
                  disabled={saving}
                  onClick={() => void setStatus("awaiting_parts")}
                >
                  Awaiting parts
                </Button>
                <Button
                  className="min-h-12"
                  disabled={saving}
                  onClick={() => void setStatus("completed")}
                >
                  Mark complete
                </Button>
              </>
            )}
            {repair.status === "awaiting_parts" && (
              <Button
                className="min-h-12 col-span-2"
                disabled={saving}
                onClick={() => void setStatus("in_progress")}
              >
                Parts received, resume
              </Button>
            )}
          </section>
        )}

        <section className="elevated-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Photos & proof</h2>
          <p className="mb-3 text-xs text-muted-foreground">
            Saved to browser storage. Use your camera on site.
          </p>
          {!isDone && (
            <div className="mb-4 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="min-h-12"
                disabled={saving}
                onClick={() => {
                  if (cameraRef.current) {
                    cameraRef.current.dataset.kind = "before";
                    cameraRef.current.click();
                  }
                }}
              >
                Before photo
              </Button>
              <Button
                type="button"
                className="min-h-12"
                disabled={saving}
                onClick={() => {
                  if (cameraRef.current) {
                    cameraRef.current.dataset.kind = "after";
                    cameraRef.current.click();
                  }
                }}
              >
                After photo
              </Button>
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  const kind = (e.target.dataset.kind as AttachmentKind) ?? "after";
                  if (files?.length) void upload(Array.from(files), kind);
                  e.target.value = "";
                }}
              />
            </div>
          )}
          <RepairAttachments
            attachments={repair.attachments ?? []}
            onUpload={(files, kind) => upload(files, kind)}
            onDelete={async (attachmentId) => {
              const updated = await removeRepairAttachment(repair.id, attachmentId);
              setRepair(updated);
            }}
            readOnly={isDone}
          />
        </section>

        <section className="elevated-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Parts needed</h2>
          <RepairPartRequests
            repairId={repair.id}
            partRequests={repair.partRequests ?? []}
            readOnly={isDone}
            defaultRequester={user.name}
            onSubmit={async (input) => {
              const updated = await addPartRequest(repair.id, input, user.name);
              setRepair(updated);
            }}
          />
        </section>

        <section className="elevated-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Notes</h2>
          <RepairComments
            comments={repair.comments ?? []}
            defaultAuthor={user.name}
            readOnly={isDone}
            onAdd={async (author, body) => {
              const updated = await addRepairComment(repair.id, author, body);
              setRepair(updated);
            }}
          />
        </section>

        {!isDone && repair.status === "in_progress" && (
          <section className="elevated-card p-4">
            <h2 className="text-sm font-semibold">Actual cost (optional)</h2>
            <input
              type="number"
              min="0"
              step="0.01"
              className="mt-2 flex min-h-12 w-full rounded-xl border border-input bg-background px-3 text-sm"
              placeholder="ZAR amount"
              defaultValue={repair.actual_cost ?? ""}
              onBlur={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) : null;
                void updateRepair(repair.id, {
                  actual_cost: val,
                  actor: user.name,
                }).then(() => setRepair(getRepairById(repair.id) ?? null));
              }}
            />
          </section>
        )}
      </main>
    </div>
  );
}
