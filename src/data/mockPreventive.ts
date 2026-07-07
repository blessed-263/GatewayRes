import { format, addDays } from "date-fns";
import type { PreventiveSchedule } from "@/types/operations";

const today = format(new Date(), "yyyy-MM-dd");

export const initialPreventiveSchedules: PreventiveSchedule[] = [
  {
    id: "pm-fire-ext",
    name: "Fire extinguisher inspection",
    building: "Genesis",
    unit: "Lobby",
    category: "other",
    frequency: "monthly",
    nextDue: today,
    assignee: "Given K.",
    templateId: "tpl-ac-filter",
    lastCompletedAt: "2026-05-01",
    active: true,
  },
  {
    id: "pm-hvac-filter",
    name: "HVAC filter replacement",
    building: "Lascelles",
    category: "hvac",
    frequency: "quarterly",
    nextDue: format(addDays(new Date(), 5), "yyyy-MM-dd"),
    assignee: "Given K.",
    templateId: "tpl-ac-filter",
    lastCompletedAt: "2026-02-10",
    active: true,
  },
  {
    id: "pm-pest-round",
    name: "Pest control walkthrough",
    building: "Claim Street Main",
    category: "pest_control",
    frequency: "monthly",
    nextDue: format(addDays(new Date(), -2), "yyyy-MM-dd"),
    assignee: "Zanele R.",
    templateId: "tpl-pest-inspect",
    lastCompletedAt: "2026-04-08",
    active: true,
  },
  {
    id: "pm-electrical-test",
    name: "Annual electrical safety test",
    building: "Truman House",
    category: "electrical",
    frequency: "annual",
    nextDue: format(addDays(new Date(), 14), "yyyy-MM-dd"),
    assignee: "Lerato M.",
    templateId: "tpl-socket",
    lastCompletedAt: "2025-06-01",
    active: true,
  },
];
