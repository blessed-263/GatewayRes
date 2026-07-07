import type { RepairCategory } from "@/types/repair";

export const complaintTypeOptions: {
  label: string;
  value: RepairCategory;
}[] = [
  { label: "Water related", value: "plumbing" },
  { label: "Electricity related", value: "electrical" },
  { label: "Furniture related", value: "structural" },
  { label: "Pest control related", value: "pest_control" },
  { label: "Housekeeping", value: "other" },
];

export const complaintTypeLabels: Record<RepairCategory, string> = {
  plumbing: "Water related",
  electrical: "Electricity related",
  hvac: "HVAC",
  structural: "Furniture related",
  appliance: "Appliance",
  pest_control: "Pest control related",
  painting: "Painting",
  other: "Housekeeping",
};

export function complaintLabelForCategory(category: RepairCategory): string {
  return complaintTypeLabels[category] ?? category;
}
