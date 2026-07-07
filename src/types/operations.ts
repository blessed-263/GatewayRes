import type { RepairCategory, RepairPriority } from "@/types/repair";

export type RepairSource = "reactive" | "preventive" | "template";

export interface PropertyUnit {
  id: string;
  code: string;
  type: "room" | "common" | "utility";
  beds?: number;
}

export interface PropertyFloor {
  id: string;
  name: string;
  units: PropertyUnit[];
}

export interface PropertySite {
  id: string;
  name: string;
  slug: string;
  address: string;
  floors: PropertyFloor[];
}

export interface SlaTargets {
  respondHours: number;
  resolveHours: number;
}

export interface JobTemplate {
  id: string;
  name: string;
  category: RepairCategory;
  building?: string;
  defaultPriority: RepairPriority;
  estimatedCost?: number;
  description: string;
  checklist: string[];
  defaultAssignee?: string;
}

export type PreventiveFrequency = "weekly" | "monthly" | "quarterly" | "annual";

export interface PreventiveSchedule {
  id: string;
  name: string;
  building: string;
  unit?: string;
  category: RepairCategory;
  frequency: PreventiveFrequency;
  nextDue: string;
  assignee?: string;
  templateId?: string;
  lastCompletedAt?: string;
  active: boolean;
}

export type QuoteStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "in_progress"
  | "completed";

export interface RepairQuote {
  id: string;
  amount: number;
  scope: string;
  status: QuoteStatus;
  submittedAt?: string;
  submittedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  notes?: string;
}

export type ApprovalStatus = "none" | "pending" | "approved" | "rejected";

export interface ContractorInvoice {
  id: string;
  repairId: string;
  amount: number;
  description: string;
  status: "pending" | "approved" | "paid";
  submittedAt: string;
  paidAt?: string;
}

export interface Contractor {
  id: string;
  slug: string;
  name: string;
  trade: string;
  contactEmail: string;
  buildings: string[];
  active: boolean;
  invoices: ContractorInvoice[];
}
