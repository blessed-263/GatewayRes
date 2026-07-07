import type { JobTemplate } from "@/types/operations";

export const jobTemplates: JobTemplate[] = [
  {
    id: "tpl-leak-tap",
    name: "Leaking tap — standard fix",
    category: "plumbing",
    building: "Genesis",
    defaultPriority: "medium",
    estimatedCost: 850,
    description: "Inspect washers, replace cartridge if needed, test flow and check for cabinet damp.",
    checklist: ["Isolate water", "Replace washer/cartridge", "Test 5 min", "Photo after"],
    defaultAssignee: "Sipho N.",
  },
  {
    id: "tpl-socket",
    name: "Faulty power socket",
    category: "electrical",
    defaultPriority: "high",
    estimatedCost: 1200,
    description: "Test circuit, replace socket outlet, verify earth and label if needed.",
    checklist: ["Isolate breaker", "Test voltage", "Replace outlet", "Safety test"],
    defaultAssignee: "Lerato M.",
  },
  {
    id: "tpl-door-hinge",
    name: "Door hinge adjustment",
    category: "structural",
    building: "Truman House",
    defaultPriority: "low",
    estimatedCost: 450,
    description: "Realign wardrobe or room door, tighten hinges, lubricate pivot points.",
    checklist: ["Inspect alignment", "Adjust hinges", "Test close/latch"],
    defaultAssignee: "James M.",
  },
  {
    id: "tpl-ac-filter",
    name: "HVAC filter service",
    category: "hvac",
    defaultPriority: "medium",
    estimatedCost: 600,
    description: "Replace filters, clean vents, log airflow reading.",
    checklist: ["Replace filters", "Vacuum vents", "Log readings"],
    defaultAssignee: "Given K.",
  },
  {
    id: "tpl-pest-inspect",
    name: "Pest inspection round",
    category: "pest_control",
    defaultPriority: "medium",
    estimatedCost: 2500,
    description: "Monthly pest walkthrough — kitchens, refuse areas, common bathrooms.",
    checklist: ["Bait stations", "Entry points", "Student report follow-up"],
    defaultAssignee: "Zanele R.",
  },
];
