export type InventoryCategory =
  | "plumbing"
  | "electrical"
  | "hvac"
  | "structural"
  | "appliance"
  | "consumable"
  | "tooling"
  | "safety";

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: InventoryCategory;
  onHand: number;
  reorderLevel: number;
  unit: string;
  location: string;
  updatedAt: string;
}
