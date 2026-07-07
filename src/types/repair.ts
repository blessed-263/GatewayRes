export type RepairStatus =
  | "open"
  | "in_progress"
  | "awaiting_parts"
  | "completed"
  | "cancelled";

export type RepairPriority = "low" | "medium" | "high" | "urgent";

export type RepairCategory =
  | "plumbing"
  | "electrical"
  | "hvac"
  | "structural"
  | "appliance"
  | "pest_control"
  | "painting"
  | "other";

import type { Building } from "@/data/propertyMaster";
import type {
  ApprovalStatus,
  RepairQuote,
  RepairSource,
} from "@/types/operations";

export type { Building };

export type AttachmentKind = "report" | "before" | "after" | "invoice";

export type PartRequestStatus = "pending" | "ordered" | "received" | "cancelled";
export type PartRequestKind = "part" | "tool";

export interface PartRequest {
  id: string;
  repairId: string;
  requestedKind: PartRequestKind;
  partName: string;
  description?: string;
  quantity: number;
  status: PartRequestStatus;
  requestedBy: string;
  requestedAt: string;
  updatedAt?: string;
  supplier?: string;
  estimatedCost?: number;
  inventoryItemId?: string;
  allocatedQuantity?: number;
  allocatedAt?: string;
  allocatedBy?: string;
  pickedForDay?: boolean;
  pickedAt?: string;
}

export interface CreatePartRequestInput {
  requestedKind?: PartRequestKind;
  partName: string;
  description?: string;
  quantity: number;
  supplier?: string;
  estimatedCost?: number;
  /** When true, sets the repair to awaiting_parts after submitting. */
  markAwaitingParts?: boolean;
}

export interface RepairAttachment {
  id: string;
  repairId: string;
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  kind: AttachmentKind;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface RepairComment {
  id: string;
  repairId: string;
  author: string;
  body: string;
  createdAt: string;
  /** When true, note is from a supervisor and shown in red to workers. */
  isSupervisor?: boolean;
}

export interface ActivityEntry {
  id: string;
  repairId: string;
  action: string;
  detail?: string;
  actor?: string;
  createdAt: string;
}

export interface Repair {
  id: string;
  unit: string;
  building: Building;
  floor?: string;
  title: string;
  description: string;
  category: RepairCategory;
  status: RepairStatus;
  priority: RepairPriority;
  reportedAt: string;
  completedAt?: string;
  closedBy?: string;
  reportedBy: string;
  /** Name of the logged-in account that captured this request (e.g. front-desk logger, supervisor). */
  loggedBy?: string;
  residentPhone?: string;
  assignedTo?: string;
  assignmentMode?: "auto" | "manual";
  scheduledFor?: string;
  estimated_cost?: number;
  actual_cost?: number;
  updatedAt?: string;
  attachmentCount?: number;
  commentCount?: number;
  partRequestCount?: number;
  needsTools?: boolean;
  attachments?: RepairAttachment[];
  comments?: RepairComment[];
  partRequests?: PartRequest[];
  activity?: ActivityEntry[];
  source?: RepairSource;
  templateId?: string;
  preventiveScheduleId?: string;
  slaRespondBy?: string;
  slaResolveBy?: string;
  slaBreached?: boolean;
  approvalStatus?: ApprovalStatus;
  approvalRequiredBecause?: string;
  quote?: RepairQuote;
  contractorId?: string;
}

export interface CreateRepairInput {
  unit: string;
  building: Building;
  floor?: string;
  title: string;
  description: string;
  category: RepairCategory;
  priority?: RepairPriority;
  reportedBy: string;
  loggedBy?: string;
  residentPhone?: string;
  estimated_cost?: number;
  source?: RepairSource;
  templateId?: string;
  preventiveScheduleId?: string;
  contractorId?: string;
}

export interface UpdateRepairInput {
  unit?: string;
  building?: Building;
  title?: string;
  description?: string;
  category?: RepairCategory;
  status?: RepairStatus;
  priority?: RepairPriority;
  reportedBy?: string;
  residentPhone?: string;
  assignedTo?: string | null;
  assignmentMode?: "auto" | "manual";
  scheduledFor?: string | null;
  estimated_cost?: number | null;
  actual_cost?: number | null;
  needsTools?: boolean | null;
  actor?: string;
  quote?: import("@/types/operations").RepairQuote | null;
  approvalStatus?: import("@/types/operations").ApprovalStatus;
  approvalRequiredBecause?: string | null;
  contractorId?: string | null;
}
