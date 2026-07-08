import { format } from "date-fns";
import type { PartRequest, Repair, RepairAttachment } from "@/types/repair";

const today = format(new Date(), "yyyy-MM-dd");
const tomorrow = format(new Date(Date.now() + 86400000), "yyyy-MM-dd");

function seedAttachment(
  repairId: string,
  kind: RepairAttachment["kind"],
  name: string,
  url: string,
  uploadedAt: string,
  uploadedBy: string
): RepairAttachment {
  return {
    id: `att-${repairId}-${kind}`,
    repairId,
    url,
    filename: name,
    originalName: name,
    mimeType: "image/jpeg",
    size: 240000,
    kind,
    uploadedAt,
    uploadedBy,
  };
}

function seedPart(
  repairId: string,
  partName: string,
  status: PartRequest["status"],
  requestedBy: string,
  requestedAt: string,
  quantity = 1
): PartRequest {
  return {
    id: `part-${repairId}-${partName.replace(/\s+/g, "-").toLowerCase()}`,
    repairId,
    requestedKind: "part",
    partName,
    quantity,
    status,
    requestedBy,
    requestedAt,
    updatedAt: requestedAt,
    description: undefined,
    supplier: status === "ordered" ? "BuildIt JHB" : undefined,
    estimatedCost: 180,
  };
}

export const initialRepairs: Repair[] = [
  {
    id: "GR-2401",
    unit: "B204",
    building: "Genesis",
    floor: "2",
    title: "Leaking kitchen tap",
    description: "Water dripping under sink; student reported damp cupboard.",
    category: "plumbing",
    status: "in_progress",
    priority: "medium",
    reportedAt: "2026-05-28T09:15:00Z",
    reportedBy: "Thabo M.",
    loggedBy: "Thabo M.",
    assignedTo: "Sipho N.",
    scheduledFor: today,
    estimated_cost: 850,
    actual_cost: 620,
    attachments: [
      seedAttachment(
        "GR-2401",
        "report",
        "leak-under-sink.jpg",
        "/images/gateway-residence.jpg",
        "2026-05-28T09:20:00Z",
        "Thabo M."
      ),
      seedAttachment(
        "GR-2401",
        "before",
        "tap-before.jpg",
        "/images/gateway-residence.jpg",
        "2026-05-29T10:00:00Z",
        "Sipho N."
      ),
    ],
    partRequests: [
      seedPart(
        "GR-2401",
        "Kitchen tap cartridge",
        "received",
        "Sipho N.",
        "2026-05-29T11:00:00Z"
      ),
    ],
  },
  {
    id: "GR-2403",
    unit: "308",
    building: "Truman House",
    floor: "3",
    title: "Broken wardrobe door",
    description: "Hinge snapped; door hanging loose and unsafe.",
    category: "appliance",
    status: "awaiting_parts",
    priority: "low",
    reportedAt: "2026-05-20T11:00:00Z",
    reportedBy: "James P.",
    loggedBy: "Gateway Kiosk",
    assignedTo: "James M.",
    scheduledFor: tomorrow,
    estimated_cost: 450,
    attachments: [
      seedAttachment(
        "GR-2403",
        "report",
        "wardrobe-hinge.jpg",
        "/images/gateway-residence.jpg",
        "2026-05-20T11:05:00Z",
        "Gateway Kiosk"
      ),
    ],
    partRequests: [
      seedPart(
        "GR-2403",
        "Wardrobe hinge set",
        "ordered",
        "James M.",
        "2026-05-21T09:00:00Z",
        2
      ),
      seedPart(
        "GR-2403",
        "Soft-close damper",
        "pending",
        "James M.",
        "2026-05-22T14:30:00Z"
      ),
    ],
  },
  {
    id: "GR-2404",
    unit: "101",
    building: "Claim Street Main",
    floor: "Ground floor",
    title: "Shower drain blocked",
    description: "Water pooling in shower tray; slow drainage over 3 days.",
    category: "plumbing",
    status: "completed",
    priority: "medium",
    reportedAt: "2026-05-15T08:45:00Z",
    completedAt: "2026-05-17T16:20:00Z",
    reportedBy: "Nomsa D.",
    loggedBy: "Gateway Kiosk",
    assignedTo: "Sipho N.",
    estimated_cost: 600,
    actual_cost: 580,
  },
  {
    id: "GR-2407",
    unit: "102",
    building: "Truman House",
    floor: "1",
    title: "Cracked window pane",
    description: "Small crack on bedroom window; no draft yet.",
    category: "structural",
    status: "completed",
    priority: "low",
    reportedAt: "2026-05-10T10:00:00Z",
    completedAt: "2026-05-12T11:30:00Z",
    reportedBy: "Amy S.",
    loggedBy: "Gateway Kiosk",
    assignedTo: "David W.",
    estimated_cost: 2200,
    actual_cost: 2100,
  },
  {
    id: "GR-2409",
    unit: "B108",
    building: "Genesis",
    floor: "2",
    title: "Desk chair wheel broken",
    description: "One caster missing; chair unstable.",
    category: "appliance",
    status: "completed",
    priority: "low",
    reportedAt: "2026-05-22T15:45:00Z",
    completedAt: "2026-05-24T09:00:00Z",
    reportedBy: "Priya N.",
    loggedBy: "Gateway Kiosk",
    assignedTo: "Given K.",
    estimated_cost: 280,
    actual_cost: 280,
  },
];
