import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RepairAttachments } from "@/components/dashboard/RepairAttachments";
import { RepairComments } from "@/components/dashboard/RepairComments";
import { RepairPartRequests } from "@/components/dashboard/RepairPartRequests";
import { assignableMembers } from "@/data/teamMembers";
import { useAuth } from "@/context/AuthContext";
import { useRepairs } from "@/context/RepairsContext";
import { canAccessRepair } from "@/lib/repairAccess";
import {
  categoryLabels,
  priorityBadgeVariant,
  priorityLabels,
  statusBadgeVariant,
  statusLabels,
} from "@/lib/repairLabels";
import { daysOpen, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type {
  AttachmentKind,
  Building,
  Repair,
  RepairCategory,
  RepairPriority,
  RepairStatus,
} from "@/types/repair";

const buildings: Building[] = [
  "Genesis",
  "Lascelles",
  "Truman House",
  "Claim Street Main",
];

const categories: RepairCategory[] = [
  "plumbing",
  "electrical",
  "hvac",
  "structural",
  "appliance",
  "pest_control",
  "painting",
  "other",
];

const statuses: RepairStatus[] = [
  "open",
  "in_progress",
  "awaiting_parts",
  "completed",
  "cancelled",
];

const actionLabels: Record<string, string> = {
  created: "Created",
  status_changed: "Status changed",
  assigned: "Assignment",
  scheduled: "Schedule",
  cost_updated: "Cost updated",
  attachment_added: "File uploaded",
  attachment_removed: "File removed",
  comment_added: "Note added",
  part_requested: "Part requested",
  assignment_overridden: "Assignment overridden",
  auto_assigned: "Auto-assigned",
  closed_by: "Closed",
  reopened: "Reopened",
};

export function RepairDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isRole } = useAuth();
  const {
    repairs,
    getRepairById,
    updateRepair,
    updateRepairStatus,
    assignRepair,
    scheduleRepair,
    deleteRepair,
    uploadRepairFiles,
    removeRepairAttachment,
    addRepairComment,
    addPartRequest,
    updatePartRequestStatus,
  } = useRepairs();

  const [repair, setRepair] = useState<Repair | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    const r = getRepairById(id);
    if (!r) {
      setError("Maintenance job not found");
      setLoading(false);
      return;
    }
    if (!canAccessRepair(r, user)) {
      if (user.role === "worker") {
        navigate(`/my-jobs/${id}`, { replace: true });
      } else {
        navigate("/tasks", { replace: true });
      }
      return;
    }
    setRepair(r);
    setError(null);
    setLoading(false);
  }, [id, user, getRepairById, repairs, navigate]);

  async function saveField(patch: Parameters<typeof updateRepair>[1]) {
    if (!repair) return;
    setSaving(true);
    try {
      const updated = await updateRepair(repair.id, patch);
      setRepair(updated);
    } finally {
      setSaving(false);
    }
  }

  if (loading && !repair) {
    return (
      <main className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
        Loading maintenance job…
      </main>
    );
  }

  if (error || !repair) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">{error ?? "Maintenance job not found"}</p>
        <Button asChild variant="outline">
          <Link to="/tasks">Back to maintenance jobs</Link>
        </Button>
      </main>
    );
  }

  const isSupervisor = isRole("supervisor");
  const isDone =
    repair.status === "completed" || repair.status === "cancelled";
  const damagePhotos = (repair.attachments ?? []).filter(
    (a) =>
      a.mimeType.startsWith("image/") &&
      (a.kind === "report" || a.kind === "before")
  );

  return (
    <>
      <PageHeader
        title={repair.title}
        description={`${repair.id} · ${repair.unit} · ${repair.building}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/tasks">
                ← Back
              </Link>
            </Button>
            {isRole("supervisor") && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (
                    window.confirm(
                      `Delete maintenance job ${repair.id}? This cannot be undone.`
                    )
                  ) {
                    void deleteRepair(repair.id).then(() => navigate("/tasks"));
                  }
                }}
              >
                Delete
              </Button>
            )}
          </div>
        }
      />

      <main className="flex-1 space-y-6 p-4 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusBadgeVariant(repair.status)}>
            {statusLabels[repair.status]}
          </Badge>
          <Badge variant={priorityBadgeVariant(repair.priority)}>
            {priorityLabels[repair.priority]}
          </Badge>
          <Badge variant="outline">{categoryLabels[repair.category]}</Badge>
          {repair.attachmentCount && !isSupervisor ? (
            <Badge variant="secondary">{repair.attachmentCount} files</Badge>
          ) : null}
          {repair.partRequestCount && !isSupervisor ? (
            <Badge variant="secondary">{repair.partRequestCount} parts</Badge>
          ) : null}
          {repair.status !== "completed" && (
            <span className="text-sm text-muted-foreground">
              {daysOpen(repair.reportedAt)} days open
            </span>
          )}
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList className={cn("grid h-auto w-full sm:w-auto", isSupervisor ? "grid-cols-3" : "grid-cols-5")}>
            <TabsTrigger value="details">Details</TabsTrigger>
            {!isSupervisor && <TabsTrigger value="files">Photos</TabsTrigger>}
            {!isSupervisor && <TabsTrigger value="parts">Parts</TabsTrigger>}
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {!isSupervisor && damagePhotos.length > 0 && (
            <div className="elevated-card p-4">
              <h3 className="mb-3 text-sm font-semibold">Reported damage</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {damagePhotos.map((photo) => (
                  <a
                    key={photo.id}
                    href={photo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="photo-card block overflow-hidden"
                  >
                    <img
                      src={photo.url}
                      alt={photo.originalName}
                      className="aspect-square w-full object-cover"
                    />
                    <p className="truncate p-2 text-xs text-muted-foreground">
                      {photo.originalName}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}

          <TabsContent value="details">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Issue details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Unit">
                    <Input
                      value={repair.unit}
                      onChange={(e) =>
                        setRepair({ ...repair, unit: e.target.value })
                      }
                      onBlur={() => void saveField({ unit: repair.unit })}
                    />
                  </Field>
                  <Field label="Building">
                    <Select
                      value={repair.building}
                      onValueChange={(v) => {
                        const building = v as Building;
                        setRepair({ ...repair, building });
                        void saveField({ building });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {buildings.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Field label="Title">
                  <Input
                    value={repair.title}
                    onChange={(e) =>
                      setRepair({ ...repair, title: e.target.value })
                    }
                    onBlur={() => void saveField({ title: repair.title })}
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={repair.description}
                    onChange={(e) =>
                      setRepair({ ...repair, description: e.target.value })
                    }
                    onBlur={() =>
                      void saveField({ description: repair.description })
                    }
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Category">
                    <Select
                      value={repair.category}
                      onValueChange={(v) => {
                        const category = v as RepairCategory;
                        setRepair({ ...repair, category });
                        void saveField({ category });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {categoryLabels[c]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Priority">
                    <Select
                      value={repair.priority}
                      onValueChange={(v) => {
                        const priority = v as RepairPriority;
                        setRepair({ ...repair, priority });
                        void saveField({ priority });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["low", "medium", "high", "urgent"] as RepairPriority[]).map(
                          (p) => (
                            <SelectItem key={p} value={p}>
                              {priorityLabels[p]}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Workflow & costs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Status">
                  <Select
                    value={repair.status}
                    onValueChange={(v) => {
                      const status = v as RepairStatus;
                      void updateRepairStatus(repair.id, status).then(() =>
                        setRepair(getRepairById(repair.id) ?? null)
                      );
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {statusLabels[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Assigned to">
                  <Select
                    value={repair.assignedTo ?? "Unassigned"}
                    onValueChange={(v) => {
                      void assignRepair(
                        repair.id,
                        v === "Unassigned" ? undefined : v
                      ).then(() => setRepair(getRepairById(repair.id) ?? null));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Unassigned">Unassigned</SelectItem>
                      {assignableMembers.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                {repair.assignmentMode && (
                  <p className="text-xs text-muted-foreground">
                    Assignment: {repair.assignmentMode === "auto" ? "Auto-assigned" : "Manual override"}
                  </p>
                )}
                <Field label="Scheduled date">
                  <Input
                    type="date"
                    value={repair.scheduledFor ?? ""}
                    onChange={(e) => {
                      const scheduledFor = e.target.value || undefined;
                      void scheduleRepair(repair.id, scheduledFor).then(() =>
                        setRepair(getRepairById(repair.id) ?? null)
                      );
                    }}
                  />
                </Field>
                {!isSupervisor && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Estimated cost (ZAR)">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={repair.estimated_cost ?? ""}
                      onChange={(e) =>
                        setRepair({
                          ...repair,
                          estimated_cost: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        })
                      }
                      onBlur={() =>
                        void saveField({
                          estimated_cost: repair.estimated_cost ?? null,
                        })
                      }
                    />
                  </Field>
                  <Field label="Actual cost (ZAR)">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={repair.actual_cost ?? ""}
                      onChange={(e) =>
                        setRepair({
                          ...repair,
                          actual_cost: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        })
                      }
                      onBlur={() =>
                        void saveField({
                          actual_cost: repair.actual_cost ?? null,
                        })
                      }
                    />
                  </Field>
                </div>
                )}
                <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                  <p>Reported {formatDate(repair.reportedAt)} by {repair.reportedBy}</p>
                  {repair.floor && <p>Floor: {repair.floor}</p>}
                  {repair.residentPhone && <p>Phone: {repair.residentPhone}</p>}
                  {repair.closedBy && (
                    <p>
                      Closed by {repair.closedBy}
                      {repair.completedAt ? ` · ${formatDate(repair.completedAt)}` : ""}
                    </p>
                  )}
                  {repair.completedAt && !repair.closedBy && (
                    <p>Completed {formatDate(repair.completedAt)}</p>
                  )}
                  {saving && <p className="text-primary">Saving…</p>}
                </div>
              </CardContent>
            </Card>
          </div>
          </TabsContent>

          <TabsContent value="files">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Photos & attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <RepairAttachments
                attachments={repair.attachments ?? []}
                onUpload={async (files, kind: AttachmentKind) => {
                  const updated = await uploadRepairFiles(
                    repair.id,
                    files,
                    kind,
                    user?.name
                  );
                  setRepair(updated);
                }}
                onDelete={async (attachmentId) => {
                  const updated = await removeRepairAttachment(
                    repair.id,
                    attachmentId
                  );
                  setRepair(updated);
                }}
              />
            </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="parts">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Parts requests</CardTitle>
            </CardHeader>
            <CardContent>
              <RepairPartRequests
                repairId={repair.id}
                partRequests={repair.partRequests ?? []}
                readOnly={isDone}
                canManageStatus={isSupervisor}
                defaultRequester={user?.name ?? "Staff"}
                onSubmit={async (input) => {
                  const updated = await addPartRequest(
                    repair.id,
                    input,
                    user?.name ?? "Staff"
                  );
                  setRepair(updated);
                }}
                onStatusChange={
                  isSupervisor
                    ? async (partRequestId, status) => {
                        const updated = await updatePartRequestStatus(
                          repair.id,
                          partRequestId,
                          status,
                          user?.name
                        );
                        setRepair(updated);
                      }
                    : undefined
                }
              />
            </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="notes">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Team notes</CardTitle>
            </CardHeader>
            <CardContent>
              <RepairComments
                comments={repair.comments ?? []}
                defaultAuthor={user?.name}
                highlightSupervisorNotes
                onAdd={async (author, body) => {
                  const updated = await addRepairComment(repair.id, author, body, {
                    isSupervisor: isRole("supervisor"),
                  });
                  setRepair(updated);
                }}
              />
            </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="history">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Activity log</CardTitle>
            </CardHeader>
            <CardContent>
              {(repair.activity ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                <ul className="space-y-3">
                  {(repair.activity ?? []).map((entry) => (
                    <li
                      key={entry.id}
                      className="flex flex-col gap-1 border-b border-border/40 pb-3 last:border-0 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {actionLabels[entry.action] ?? entry.action}
                        </p>
                        {entry.detail && (
                          <p className="text-sm text-muted-foreground">
                            {entry.detail}
                          </p>
                        )}
                        {entry.actor && (
                          <p className="text-xs text-muted-foreground">
                            by {entry.actor}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDate(entry.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
