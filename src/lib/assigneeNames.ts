export const LEGACY_ASSIGNEE_RENAMES: Record<string, string> = {
  "Maintenance Team A": "Given K.",
  "Maintenance Team B": "James M.",
  "Electrical Contractor": "Lerato M.",
  "Security Maintenance": "Zanele R.",
  "Glazing Contractor": "David W.",
};

export const DEFAULT_ASSIGNEE = "Given K.";

export function normalizeAssignee(name: string | undefined): string | undefined {
  if (!name) return undefined;
  return LEGACY_ASSIGNEE_RENAMES[name] ?? name;
}
