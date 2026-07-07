import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { addMonths, addWeeks, format, parseISO } from "date-fns";
import { contractors as initialContractors } from "@/data/mockContractors";
import { initialPreventiveSchedules } from "@/data/mockPreventive";
import { jobTemplates as initialTemplates } from "@/data/jobTemplates";
import { HIGH_COST_APPROVAL_THRESHOLD } from "@/data/slaConfig";
import { useRepairs } from "@/context/RepairsContext";
import type {
  ApprovalStatus,
  Contractor,
  ContractorInvoice,
  JobTemplate,
  PreventiveFrequency,
  PreventiveSchedule,
  QuoteStatus,
  RepairQuote,
} from "@/types/operations";
import type { CreateRepairInput, Repair } from "@/types/repair";

const PREVENTIVE_KEY = "gateway-preventive";
const CONTRACTORS_KEY = "gateway-contractors";

function loadPreventive(): PreventiveSchedule[] {
  try {
    const saved = localStorage.getItem(PREVENTIVE_KEY);
    if (saved) return JSON.parse(saved) as PreventiveSchedule[];
  } catch {
    /* fall through */
  }
  return initialPreventiveSchedules;
}

function loadContractors(): Contractor[] {
  try {
    const saved = localStorage.getItem(CONTRACTORS_KEY);
    if (saved) return JSON.parse(saved) as Contractor[];
  } catch {
    /* fall through */
  }
  return initialContractors;
}

function nextDueFromFrequency(frequency: PreventiveFrequency, from: Date): string {
  switch (frequency) {
    case "weekly":
      return format(addWeeks(from, 1), "yyyy-MM-dd");
    case "monthly":
      return format(addMonths(from, 1), "yyyy-MM-dd");
    case "quarterly":
      return format(addMonths(from, 3), "yyyy-MM-dd");
    case "annual":
      return format(addMonths(from, 12), "yyyy-MM-dd");
  }
}

interface OperationsContextValue {
  jobTemplates: JobTemplate[];
  preventiveSchedules: PreventiveSchedule[];
  contractors: Contractor[];
  pendingApprovals: Repair[];
  pendingQuotes: Repair[];
  createRepairFromTemplate: (
    templateId: string,
    unit: string,
    building: string,
    actor?: string
  ) => Promise<Repair>;
  generatePreventiveTask: (scheduleId: string, actor?: string) => Promise<Repair | null>;
  completePreventiveSchedule: (scheduleId: string) => void;
  submitQuote: (
    repairId: string,
    scope: string,
    amount: number,
    submittedBy: string
  ) => Promise<void>;
  updateQuoteStatus: (
    repairId: string,
    status: QuoteStatus,
    actor: string,
    notes?: string
  ) => Promise<void>;
  setApprovalStatus: (
    repairId: string,
    status: ApprovalStatus,
    actor: string,
    reason?: string
  ) => Promise<void>;
  assignContractor: (repairId: string, contractorId: string, actor?: string) => Promise<void>;
  submitContractorInvoice: (
    contractorId: string,
    repairId: string,
    amount: number,
    description: string
  ) => Promise<void>;
  updateInvoiceStatus: (
    contractorId: string,
    invoiceId: string,
    status: ContractorInvoice["status"]
  ) => void;
}

const OperationsContext = createContext<OperationsContextValue | null>(null);

export function OperationsProvider({ children }: { children: ReactNode }) {
  const { repairs, addRepair, updateRepair } = useRepairs();
  const [preventiveSchedules, setPreventiveSchedules] = useState(loadPreventive);
  const [contractors, setContractors] = useState(loadContractors);

  useEffect(() => {
    localStorage.setItem(PREVENTIVE_KEY, JSON.stringify(preventiveSchedules));
  }, [preventiveSchedules]);

  useEffect(() => {
    localStorage.setItem(CONTRACTORS_KEY, JSON.stringify(contractors));
  }, [contractors]);

  const pendingApprovals = useMemo(
    () => repairs.filter((r) => r.approvalStatus === "pending"),
    [repairs]
  );

  const pendingQuotes = useMemo(
    () =>
      repairs.filter(
        (r) => r.quote && (r.quote.status === "submitted" || r.quote.status === "draft")
      ),
    [repairs]
  );

  const createRepairFromTemplate = useCallback(
    async (templateId: string, unit: string, building: string, actor = "Supervisor") => {
      const template = initialTemplates.find((t) => t.id === templateId);
      if (!template) throw new Error("Template not found");

      const input: CreateRepairInput = {
        unit,
        building: building as CreateRepairInput["building"],
        title: template.name,
        description: `${template.description}\n\nChecklist:\n${template.checklist.map((c) => `• ${c}`).join("\n")}`,
        category: template.category,
        priority: template.defaultPriority,
        reportedBy: actor,
        loggedBy: actor,
        estimated_cost: template.estimatedCost,
        source: "template",
        templateId: template.id,
      };

      const repair = await addRepair(input);
      if (template.defaultAssignee) {
        await updateRepair(repair.id, {
          assignedTo: template.defaultAssignee,
          actor,
        });
      }
      return repair;
    },
    [addRepair, updateRepair]
  );

  const generatePreventiveTask = useCallback(
    async (scheduleId: string, actor = "Supervisor") => {
      const schedule = preventiveSchedules.find((s) => s.id === scheduleId);
      if (!schedule) return null;

      const template = schedule.templateId
        ? initialTemplates.find((t) => t.id === schedule.templateId)
        : undefined;

      const input: CreateRepairInput = {
        unit: schedule.unit ?? "Common areas",
        building: schedule.building as CreateRepairInput["building"],
        title: schedule.name,
        description:
          template?.description ??
          `Scheduled ${schedule.frequency} preventive maintenance for ${schedule.building}.`,
        category: schedule.category,
        priority: template?.defaultPriority ?? "medium",
        reportedBy: actor,
        loggedBy: actor,
        estimated_cost: template?.estimatedCost,
        source: "preventive",
        preventiveScheduleId: schedule.id,
      };

      const repair = await addRepair(input);
      const assignee = schedule.assignee ?? template?.defaultAssignee;
      if (assignee) {
        await updateRepair(repair.id, { assignedTo: assignee, actor });
      }
      return repair;
    },
    [addRepair, preventiveSchedules, updateRepair]
  );

  const completePreventiveSchedule = useCallback((scheduleId: string) => {
    setPreventiveSchedules((prev) =>
      prev.map((schedule) => {
        if (schedule.id !== scheduleId) return schedule;
        const now = new Date();
        return {
          ...schedule,
          lastCompletedAt: format(now, "yyyy-MM-dd"),
          nextDue: nextDueFromFrequency(schedule.frequency, now),
        };
      })
    );
  }, []);

  const submitQuote = useCallback(
    async (repairId: string, scope: string, amount: number, submittedBy: string) => {
      const quote: RepairQuote = {
        id: crypto.randomUUID(),
        amount,
        scope,
        status: amount >= HIGH_COST_APPROVAL_THRESHOLD ? "submitted" : "approved",
        submittedAt: new Date().toISOString(),
        submittedBy,
        approvedAt: amount < HIGH_COST_APPROVAL_THRESHOLD ? new Date().toISOString() : undefined,
        approvedBy: amount < HIGH_COST_APPROVAL_THRESHOLD ? "Auto-approved" : undefined,
      };

      await updateRepair(repairId, {
        quote,
        estimated_cost: amount,
        approvalStatus: amount >= HIGH_COST_APPROVAL_THRESHOLD ? "pending" : "approved",
        approvalRequiredBecause:
          amount >= HIGH_COST_APPROVAL_THRESHOLD ? "Quote exceeds approval threshold" : undefined,
        actor: submittedBy,
      });
    },
    [updateRepair]
  );

  const updateQuoteStatus = useCallback(
    async (repairId: string, status: QuoteStatus, actor: string, notes?: string) => {
      const repair = repairs.find((r) => r.id === repairId);
      if (!repair?.quote) return;

      const quote: RepairQuote = {
        ...repair.quote,
        status,
        notes: notes ?? repair.quote.notes,
        approvedAt: status === "approved" ? new Date().toISOString() : repair.quote.approvedAt,
        approvedBy: status === "approved" ? actor : repair.quote.approvedBy,
      };

      await updateRepair(repairId, {
        quote,
        approvalStatus:
          status === "approved" ? "approved" : status === "rejected" ? "rejected" : repair.approvalStatus,
        status: status === "approved" ? "in_progress" : repair.status,
        actor,
      });
    },
    [repairs, updateRepair]
  );

  const setApprovalStatus = useCallback(
    async (repairId: string, status: ApprovalStatus, actor: string, reason?: string) => {
      await updateRepair(repairId, {
        approvalStatus: status,
        approvalRequiredBecause: reason ?? undefined,
        status: status === "approved" ? "in_progress" : undefined,
        actor,
      });
    },
    [updateRepair]
  );

  const assignContractor = useCallback(
    async (repairId: string, contractorId: string, actor = "Supervisor") => {
      const contractor = contractors.find((c) => c.id === contractorId);
      await updateRepair(repairId, {
        contractorId,
        assignedTo: contractor?.name,
        actor,
      });
    },
    [contractors, updateRepair]
  );

  const submitContractorInvoice = useCallback(
    async (
      contractorId: string,
      repairId: string,
      amount: number,
      description: string
    ) => {
      const invoice: ContractorInvoice = {
        id: `inv-${crypto.randomUUID().slice(0, 8)}`,
        repairId,
        amount,
        description,
        status: "pending",
        submittedAt: new Date().toISOString(),
      };
      setContractors((prev) =>
        prev.map((c) =>
          c.id === contractorId ? { ...c, invoices: [invoice, ...c.invoices] } : c
        )
      );
    },
    []
  );

  const updateInvoiceStatus = useCallback(
    (contractorId: string, invoiceId: string, status: ContractorInvoice["status"]) => {
      setContractors((prev) =>
        prev.map((c) => {
          if (c.id !== contractorId) return c;
          return {
            ...c,
            invoices: c.invoices.map((inv) =>
              inv.id === invoiceId
                ? {
                    ...inv,
                    status,
                    paidAt: status === "paid" ? new Date().toISOString() : inv.paidAt,
                  }
                : inv
            ),
          };
        })
      );
    },
    []
  );

  const value = useMemo(
    () => ({
      jobTemplates: initialTemplates,
      preventiveSchedules,
      contractors,
      pendingApprovals,
      pendingQuotes,
      createRepairFromTemplate,
      generatePreventiveTask,
      completePreventiveSchedule,
      submitQuote,
      updateQuoteStatus,
      setApprovalStatus,
      assignContractor,
      submitContractorInvoice,
      updateInvoiceStatus,
    }),
    [
      preventiveSchedules,
      contractors,
      pendingApprovals,
      pendingQuotes,
      createRepairFromTemplate,
      generatePreventiveTask,
      completePreventiveSchedule,
      submitQuote,
      updateQuoteStatus,
      setApprovalStatus,
      assignContractor,
      submitContractorInvoice,
      updateInvoiceStatus,
    ]
  );

  return (
    <OperationsContext.Provider value={value}>{children}</OperationsContext.Provider>
  );
}

export function useOperations() {
  const ctx = useContext(OperationsContext);
  if (!ctx) throw new Error("useOperations must be used within OperationsProvider");
  return ctx;
}

export function isPreventiveOverdue(schedule: PreventiveSchedule): boolean {
  return parseISO(schedule.nextDue) < new Date();
}
