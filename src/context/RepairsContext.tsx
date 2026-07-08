import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { format } from "date-fns";
import { initialInventory } from "@/data/mockInventory";
import { initialRepairs } from "@/data/mockRepairs";
import { HIGH_COST_APPROVAL_THRESHOLD } from "@/data/slaConfig";
import { filesToAttachments } from "@/lib/fileStorage";
import { pickRandomAssignee } from "@/lib/complaintAssignment";
import { DEFAULT_ASSIGNEE, normalizeAssignee } from "@/lib/assigneeNames";
import { isRemovedRepair } from "@/lib/removedRepairs";
import { applySlaToRepair, refreshSlaBreaches } from "@/lib/sla";
import { gapBeforeStartSeconds } from "@/lib/workTime";
import type { InventoryItem } from "@/types/inventory";
import type {
  ActivityEntry,
  AttachmentKind,
  CreatePartRequestInput,
  CreateRepairInput,
  PartRequest,
  PartRequestStatus,
  Repair,
  RepairComment,
  RepairStatus,
  UpdateRepairInput,
  WorkTimeSession,
} from "@/types/repair";

const STORAGE_KEY = "gateway-repairs-v2";
const INVENTORY_STORAGE_KEY = "gateway-inventory";

interface RepairsContextValue {
  repairs: Repair[];
  isLoading: boolean;
  error: string | null;
  getRepairById: (id: string) => Repair | undefined;
  fetchRepairDetail: (id: string) => Promise<Repair>;
  addRepair: (input: CreateRepairInput, files?: File[]) => Promise<Repair>;
  updateRepair: (id: string, patch: UpdateRepairInput) => Promise<Repair>;
  updateRepairStatus: (id: string, status: RepairStatus, actor?: string) => Promise<void>;
  assignRepair: (id: string, assignedTo: string | undefined) => Promise<void>;
  scheduleRepair: (id: string, scheduledFor: string | undefined) => Promise<void>;
  deleteRepair: (id: string) => Promise<void>;
  uploadRepairFiles: (
    id: string,
    files: File[],
    kind?: AttachmentKind,
    uploadedBy?: string
  ) => Promise<Repair>;
  removeRepairAttachment: (repairId: string, attachmentId: string) => Promise<Repair>;
  addRepairComment: (
    repairId: string,
    author: string,
    body: string,
    options?: { isSupervisor?: boolean }
  ) => Promise<Repair>;
  addPartRequest: (
    repairId: string,
    input: CreatePartRequestInput,
    requestedBy: string
  ) => Promise<Repair>;
  updatePartRequestStatus: (
    repairId: string,
    partRequestId: string,
    status: PartRequestStatus,
    actor?: string
  ) => Promise<Repair>;
  inventoryItems: InventoryItem[];
  restockInventoryItem: (itemId: string, quantity: number, actor?: string) => Promise<InventoryItem>;
  allocatePartRequestFromInventory: (
    repairId: string,
    partRequestId: string,
    inventoryItemId: string,
    quantity: number,
    actor?: string
  ) => Promise<Repair>;
  markPartPickedForDay: (
    repairId: string,
    partRequestId: string,
    picked: boolean,
    actor?: string
  ) => Promise<Repair>;
}

const RepairsContext = createContext<RepairsContextValue | null>(null);

function migrateRepairAssignees(repairs: Repair[]): Repair[] {
  return repairs.map((repair) => ({
    ...repair,
    assignedTo: normalizeAssignee(repair.assignedTo),
    partRequests: repair.partRequests?.map((part) => ({
      ...part,
      requestedBy: normalizeAssignee(part.requestedBy) ?? part.requestedBy,
    })),
    activity: repair.activity?.map((entry) => ({
      ...entry,
      actor: normalizeAssignee(entry.actor) ?? entry.actor,
    })),
  }));
}

function loadRepairs(): Repair[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = migrateRepairAssignees(
        (JSON.parse(saved) as Repair[]).filter((r) => !isRemovedRepair(r))
      );
      return refreshSlaBreaches(parsed);
    }
  } catch {
    /* fall through */
  }
  return refreshSlaBreaches(initialRepairs);
}

function loadInventory(): InventoryItem[] {
  try {
    const saved = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (saved) return JSON.parse(saved) as InventoryItem[];
  } catch {
    /* fall through */
  }
  return initialInventory;
}

function withCounts(repair: Repair): Repair {
  return {
    ...repair,
    attachmentCount: repair.attachments?.length ?? 0,
    commentCount: repair.comments?.length ?? 0,
    partRequestCount: repair.partRequests?.length ?? 0,
  };
}

function nextRepairId(repairs: Repair[]): string {
  const year = new Date().getFullYear();
  const prefix = `GR-${year}-`;
  const seq = repairs
    .map((r) => r.id)
    .filter((id) => id.startsWith(prefix))
    .map((id) => parseInt(id.split("-").pop() ?? "0", 10))
    .reduce((max, n) => Math.max(max, n), 0);
  return `${prefix}${String(seq + 1).padStart(4, "0")}`;
}

function logActivity(
  repair: Repair,
  action: string,
  detail?: string,
  actor?: string
): ActivityEntry[] {
  const entry: ActivityEntry = {
    id: crypto.randomUUID(),
    repairId: repair.id,
    action,
    detail,
    actor,
    createdAt: new Date().toISOString(),
  };
  return [entry, ...(repair.activity ?? [])];
}

function endOpenWorkSessions(
  repair: Repair,
  now: string,
  actor: string,
  detailPrefix: string
): Repair {
  const sessions = repair.workSessions ?? [];
  if (!sessions.some((session) => !session.endedAt)) return repair;

  let next = repair;
  const nextSessions = sessions.map((session) => {
    if (session.endedAt) return session;
    const durationSec = Math.max(
      0,
      Math.round((new Date(now).getTime() - new Date(session.startedAt).getTime()) / 1000)
    );
    next = {
      ...next,
      activity: logActivity(
        next,
        "work_timer_stopped",
        `${detailPrefix} · worked ${durationSec}s`,
        actor
      ),
    };
    return { ...session, endedAt: now };
  });

  return { ...next, workSessions: nextSessions };
}

function startWorkSessionOnRepair(
  repair: Repair,
  allRepairs: Repair[],
  workerName: string,
  now: string
): Repair {
  const sessions = repair.workSessions ?? [];
  if (sessions.some((session) => !session.endedAt)) return repair;

  const gapBeforeSeconds = gapBeforeStartSeconds(allRepairs, workerName, now);
  const session: WorkTimeSession = {
    id: crypto.randomUUID(),
    workerName,
    startedAt: now,
    gapBeforeSeconds: gapBeforeSeconds > 0 ? gapBeforeSeconds : undefined,
  };

  return {
    ...repair,
    workSessions: [...sessions, session],
    activity: logActivity(
      repair,
      "work_timer_started",
      gapBeforeSeconds > 0
        ? `Started after ${gapBeforeSeconds}s gap`
        : "Work timer started (In Progress)",
      workerName
    ),
  };
}

function endWorkerActiveSessionsElsewhere(
  repairs: Repair[],
  targetRepairId: string,
  workerName: string,
  now: string
): Repair[] {
  return repairs.map((repair) => {
    if (repair.id === targetRepairId) return repair;
    const sessions = repair.workSessions ?? [];
    const open = sessions.find(
      (session) => !session.endedAt && session.workerName === workerName
    );
    if (!open) return repair;
    return withCounts(
      endOpenWorkSessions(repair, now, workerName, "Auto-ended (another job started)")
    );
  });
}

export function RepairsProvider({ children }: { children: ReactNode }) {
  const [repairs, setRepairs] = useState<Repair[]>(() =>
    loadRepairs().map(withCounts)
  );
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() =>
    loadInventory()
  );
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(repairs));
  }, [repairs]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRepairs((prev) => refreshSlaBreaches(prev));
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventoryItems));
  }, [inventoryItems]);

  const getRepairById = useCallback(
    (id: string) => repairs.find((r) => r.id === id),
    [repairs]
  );

  const fetchRepairDetail = useCallback(
    async (id: string) => {
      const repair = repairs.find((r) => r.id === id);
      if (!repair) throw new Error("Repair not found");
      return repair;
    },
    [repairs]
  );

  const updateRepair = useCallback(async (id: string, patch: UpdateRepairInput) => {
    let updated!: Repair;
    setRepairs((prev) => {
      const current = prev.find((repair) => repair.id === id);
      if (!current) return prev;

      const now = new Date().toISOString();
      const actor = patch.actor ?? "Staff";

      let list = prev;
      if (patch.status === "in_progress" && current.status !== "in_progress") {
        const timerWorker = (patch.assignedTo ?? current.assignedTo) ?? actor;
        list = endWorkerActiveSessionsElsewhere(prev, id, timerWorker, now);
      }

      return list.map((r) => {
        if (r.id !== id) return r;

        let next: Repair = {
          ...r,
          ...patch,
          assignedTo: patch.assignedTo === null ? undefined : patch.assignedTo ?? r.assignedTo,
          scheduledFor:
            patch.scheduledFor === null ? undefined : patch.scheduledFor ?? r.scheduledFor,
          estimated_cost:
            patch.estimated_cost === null ? undefined : patch.estimated_cost ?? r.estimated_cost,
          actual_cost:
            patch.actual_cost === null ? undefined : patch.actual_cost ?? r.actual_cost,
          needsTools:
            patch.needsTools === null ? undefined : patch.needsTools ?? r.needsTools,
          quote: patch.quote === null ? undefined : patch.quote ?? r.quote,
          approvalStatus: patch.approvalStatus ?? r.approvalStatus,
          approvalRequiredBecause:
            patch.approvalRequiredBecause === null
              ? undefined
              : patch.approvalRequiredBecause ?? r.approvalRequiredBecause,
          contractorId:
            patch.contractorId === null ? undefined : patch.contractorId ?? r.contractorId,
          updatedAt: now,
        };

        const timerWorker = next.assignedTo ?? actor;

        if (patch.status === "completed") {
          if (!next.completedAt) next.completedAt = now;
          next.closedBy = actor;
          next = endOpenWorkSessions(next, now, actor, "Stopped on complete");
        } else if (r.status === "completed" && patch.status) {
          next.completedAt = undefined;
          next.closedBy = undefined;
        }

        if (patch.status === "in_progress" && r.status !== "in_progress") {
          next = startWorkSessionOnRepair(next, prev, timerWorker, now);
        } else if (
          r.status === "in_progress" &&
          patch.status &&
          patch.status !== "in_progress" &&
          patch.status !== "completed"
        ) {
          next = endOpenWorkSessions(next, now, actor, "Stopped on status change");
        }

        if (patch.status && patch.status !== r.status) {
          next.activity = logActivity(
            next,
            patch.status === "completed" ? "closed_by" : r.status === "completed" ? "reopened" : "status_changed",
            patch.status === "completed"
              ? `Closed by ${actor}`
              : r.status === "completed"
                ? "Reopened from completed"
                : `${r.status} → ${patch.status}`,
            actor
          );
        }
        if (patch.assignedTo !== undefined && patch.assignedTo !== r.assignedTo) {
          if (r.assignmentMode === "auto" && patch.assignedTo) {
            next.assignmentMode = "manual";
            next.activity = logActivity(
              next,
              "assignment_overridden",
              `Reassigned to ${patch.assignedTo}`,
              actor
            );
          }
          next.activity = logActivity(
            next,
            "assigned",
            patch.assignedTo ? `Assigned to ${patch.assignedTo}` : "Unassigned",
            actor
          );
        }
        if (patch.scheduledFor !== undefined && patch.scheduledFor !== r.scheduledFor) {
          next.activity = logActivity(
            next,
            "scheduled",
            patch.scheduledFor ? `Scheduled for ${patch.scheduledFor}` : "Schedule cleared",
            actor
          );
        }
        if (patch.needsTools !== undefined && patch.needsTools !== r.needsTools) {
          next.activity = logActivity(
            next,
            "tooling_flag",
            patch.needsTools ? "Marked as requiring tools" : "Marked as no tools required",
            actor
          );
        }

        updated = withCounts(next);
        return updated;
      });
    });
    return updated;
  }, []);

  const addRepair = useCallback(
    async (input: CreateRepairInput, files: File[] = []) => {
      const id = nextRepairId(repairs);
      const now = new Date().toISOString();
      let attachments: Repair["attachments"] = [];

      if (files.length > 0) {
        attachments = await filesToAttachments(id, files, "report", input.reportedBy);
      }

      const assignee = pickRandomAssignee(input.category);

      let repair = withCounts({
        id,
        ...input,
        priority: input.priority ?? "medium",
        status: "open",
        reportedAt: now,
        updatedAt: now,
        assignedTo: assignee,
        assignmentMode: assignee ? "auto" : undefined,
        attachments,
        comments: [],
        partRequests: [],
        approvalStatus:
          (input.estimated_cost ?? 0) >= HIGH_COST_APPROVAL_THRESHOLD ? "pending" : "none",
        approvalRequiredBecause:
          (input.estimated_cost ?? 0) >= HIGH_COST_APPROVAL_THRESHOLD
            ? "Estimated cost exceeds approval threshold"
            : undefined,
        activity: [
          logActivity({ id } as Repair, "created", input.title, input.reportedBy)[0],
          ...(assignee
            ? [
                logActivity(
                  { id } as Repair,
                  "auto_assigned",
                  `Auto-assigned to ${assignee}`,
                  "System"
                )[0],
              ]
            : []),
        ],
      });

      repair = applySlaToRepair(repair, now);

      setRepairs((prev) => [repair, ...prev]);
      return repair;
    },
    [repairs]
  );

  const updateRepairStatus = useCallback(
    async (id: string, status: RepairStatus, actor = "Staff") => {
      const existing = repairs.find((r) => r.id === id);
      const patch: UpdateRepairInput = { status, actor };
      if (status === "in_progress" && existing && !existing.assignedTo) {
        patch.assignedTo = DEFAULT_ASSIGNEE;
      }
      await updateRepair(id, patch);
    },
    [repairs, updateRepair]
  );

  const assignRepair = useCallback(
    async (id: string, assignedTo: string | undefined) => {
      const existing = repairs.find((r) => r.id === id);
      const patch: UpdateRepairInput = {
        assignedTo: assignedTo ?? null,
        assignmentMode: assignedTo ? "manual" : undefined,
        actor: "Supervisor",
      };
      if (
        assignedTo &&
        existing &&
        !existing.scheduledFor &&
        existing.status !== "completed" &&
        existing.status !== "cancelled"
      ) {
        patch.scheduledFor = format(new Date(), "yyyy-MM-dd");
        if (existing.status === "open") patch.status = "in_progress";
      }
      await updateRepair(id, patch);
    },
    [repairs, updateRepair]
  );

  const scheduleRepair = useCallback(
    async (id: string, scheduledFor: string | undefined) => {
      await updateRepair(id, {
        scheduledFor: scheduledFor ?? null,
        actor: "Supervisor",
      });
    },
    [updateRepair]
  );

  const deleteRepair = useCallback(async (id: string) => {
    setRepairs((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const uploadRepairFiles = useCallback(
    async (
      id: string,
      files: File[],
      kind: AttachmentKind = "report",
      uploadedBy = "Staff"
    ) => {
      const newFiles = await filesToAttachments(id, files, kind, uploadedBy);
      let updated!: Repair;
      setRepairs((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const attachments = [...(r.attachments ?? []), ...newFiles];
          const next = withCounts({
            ...r,
            attachments,
            activity: newFiles.reduce(
              (activity, f) =>
                logActivity(
                  { ...r, activity },
                  "attachment_added",
                  f.originalName,
                  uploadedBy
                ),
              r.activity ?? []
            ),
          });
          updated = next;
          return next;
        })
      );
      return updated;
    },
    []
  );

  const removeRepairAttachment = useCallback(
    async (repairId: string, attachmentId: string) => {
      let updated!: Repair;
      setRepairs((prev) =>
        prev.map((r) => {
          if (r.id !== repairId) return r;
          const removed = r.attachments?.find((a) => a.id === attachmentId);
          const attachments = (r.attachments ?? []).filter((a) => a.id !== attachmentId);
          const next = withCounts({
            ...r,
            attachments,
            activity: removed
              ? logActivity(r, "attachment_removed", removed.originalName)
              : r.activity,
          });
          updated = next;
          return next;
        })
      );
      return updated;
    },
    []
  );

  const addRepairComment = useCallback(
    async (
      repairId: string,
      author: string,
      body: string,
      options?: { isSupervisor?: boolean }
    ) => {
      let updated!: Repair;
      setRepairs((prev) =>
        prev.map((r) => {
          if (r.id !== repairId) return r;
          const comment: RepairComment = {
            id: crypto.randomUUID(),
            repairId,
            author,
            body,
            createdAt: new Date().toISOString(),
            isSupervisor: options?.isSupervisor,
          };
          const next = withCounts({
            ...r,
            comments: [...(r.comments ?? []), comment],
            activity: logActivity(r, "comment_added", body.slice(0, 80), author),
          });
          updated = next;
          return next;
        })
      );
      return updated;
    },
    []
  );

  const addPartRequest = useCallback(
    async (repairId: string, input: CreatePartRequestInput, requestedBy: string) => {
      let updated!: Repair;
      setRepairs((prev) =>
        prev.map((r) => {
          if (r.id !== repairId) return r;
          const now = new Date().toISOString();
          const request: PartRequest = {
            id: crypto.randomUUID(),
            repairId,
            requestedKind: input.requestedKind ?? "part",
            partName: input.partName.trim(),
            description: input.description?.trim() || undefined,
            quantity: Math.max(1, input.quantity),
            status: "pending",
            requestedBy,
            requestedAt: now,
            updatedAt: now,
            supplier: input.supplier?.trim() || undefined,
            estimatedCost: input.estimatedCost,
          };
          let next: Repair = withCounts({
            ...r,
            partRequests: [...(r.partRequests ?? []), request],
            updatedAt: now,
            activity: logActivity(
              r,
              "part_requested",
              `${request.quantity}× ${request.partName}`,
              requestedBy
            ),
          });
          if (input.markAwaitingParts && next.status !== "completed" && next.status !== "cancelled") {
            next = {
              ...next,
              status: "awaiting_parts",
              activity: logActivity(
                next,
                "status_changed",
                `${r.status} → awaiting_parts`,
                requestedBy
              ),
            };
          }
          updated = next;
          return next;
        })
      );
      return updated;
    },
    []
  );

  const updatePartRequestStatus = useCallback(
    async (
      repairId: string,
      partRequestId: string,
      status: PartRequestStatus,
      actor = "Supervisor"
    ) => {
      let updated!: Repair;
      setRepairs((prev) =>
        prev.map((r) => {
          if (r.id !== repairId) return r;
          const now = new Date().toISOString();
          const partRequests = (r.partRequests ?? []).map((p) =>
            p.id === partRequestId ? { ...p, status, updatedAt: now } : p
          );
          const changed = partRequests.find((p) => p.id === partRequestId);
          const next = withCounts({
            ...r,
            partRequests,
            updatedAt: now,
            activity: changed
              ? logActivity(
                  r,
                  "part_status_changed",
                  `${changed.partName}: ${status}`,
                  actor
                )
              : r.activity,
          });
          updated = next;
          return next;
        })
      );
      return updated;
    },
    []
  );

  const restockInventoryItem = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        throw new Error("Restock quantity must be greater than zero.");
      }
      let updated!: InventoryItem;
      setInventoryItems((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;
          updated = {
            ...item,
            onHand: item.onHand + Math.round(quantity),
            updatedAt: new Date().toISOString(),
          };
          return updated;
        })
      );
      return updated;
    },
    []
  );

  const allocatePartRequestFromInventory = useCallback(
    async (
      repairId: string,
      partRequestId: string,
      inventoryItemId: string,
      quantity: number,
      actor = "Supervisor"
    ) => {
      const qty = Math.max(1, Math.round(quantity));
      const item = inventoryItems.find((i) => i.id === inventoryItemId);
      if (!item) throw new Error("Inventory item not found.");
      if (item.onHand < qty) {
        throw new Error(`Not enough stock for ${item.name}. Available: ${item.onHand}`);
      }

      setInventoryItems((prev) =>
        prev.map((i) =>
          i.id === inventoryItemId
            ? { ...i, onHand: i.onHand - qty, updatedAt: new Date().toISOString() }
            : i
        )
      );

      let updated!: Repair;
      setRepairs((prev) =>
        prev.map((repair) => {
          if (repair.id !== repairId) return repair;
          const now = new Date().toISOString();
          const partRequests = (repair.partRequests ?? []).map((request) =>
            request.id === partRequestId
              ? {
                  ...request,
                  status: "received" as const,
                  inventoryItemId,
                  allocatedQuantity: qty,
                  allocatedBy: actor,
                  allocatedAt: now,
                  pickedForDay: false,
                  updatedAt: now,
                }
              : request
          );
          const allocated = partRequests.find((request) => request.id === partRequestId);
          const next = withCounts({
            ...repair,
            partRequests,
            updatedAt: now,
            activity: allocated
              ? logActivity(
                  repair,
                  "part_allocated",
                  `${qty}× ${allocated.partName} from stock`,
                  actor
                )
              : repair.activity,
          });
          updated = next;
          return next;
        })
      );
      return updated;
    },
    [inventoryItems]
  );

  const markPartPickedForDay = useCallback(
    async (
      repairId: string,
      partRequestId: string,
      picked: boolean,
      actor = "Worker"
    ) => {
      let updated!: Repair;
      setRepairs((prev) =>
        prev.map((repair) => {
          if (repair.id !== repairId) return repair;
          const now = new Date().toISOString();
          const partRequests = (repair.partRequests ?? []).map((request) =>
            request.id === partRequestId
              ? {
                  ...request,
                  pickedForDay: picked,
                  pickedAt: picked ? now : undefined,
                  updatedAt: now,
                }
              : request
          );
          const changed = partRequests.find((request) => request.id === partRequestId);
          const next = withCounts({
            ...repair,
            partRequests,
            updatedAt: now,
            activity: changed
              ? logActivity(
                  repair,
                  "part_picked",
                  `${changed.partName}: ${picked ? "picked for day" : "unpicked"}`,
                  actor
                )
              : repair.activity,
          });
          updated = next;
          return next;
        })
      );
      return updated;
    },
    []
  );

  const value = useMemo(
    () => ({
      repairs,
      isLoading,
      error,
      getRepairById,
      fetchRepairDetail,
      addRepair,
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
      inventoryItems,
      restockInventoryItem,
      allocatePartRequestFromInventory,
      markPartPickedForDay,
    }),
    [
      repairs,
      isLoading,
      error,
      getRepairById,
      fetchRepairDetail,
      addRepair,
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
      inventoryItems,
      restockInventoryItem,
      allocatePartRequestFromInventory,
      markPartPickedForDay,
    ]
  );

  return (
    <RepairsContext.Provider value={value}>{children}</RepairsContext.Provider>
  );
}

export function useRepairs() {
  const ctx = useContext(RepairsContext);
  if (!ctx) throw new Error("useRepairs must be used within RepairsProvider");
  return ctx;
}
