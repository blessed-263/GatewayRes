import {
  Bug,
  Droplets,
  Flame,
  Hammer,
  Paintbrush,
  Plug,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { RepairCategory } from "@/types/repair";

/** Icon + tinted-tile styling used as a thumbnail fallback when a repair has no photo yet. */
export const categoryIcons: Record<RepairCategory, LucideIcon> = {
  plumbing: Droplets,
  electrical: Plug,
  hvac: Flame,
  structural: Hammer,
  appliance: Wrench,
  pest_control: Bug,
  painting: Paintbrush,
  other: Wrench,
};

export const categoryTileClass: Record<RepairCategory, string> = {
  plumbing: "bg-[#1a6b72]/10 text-[#1a6b72]",
  electrical: "bg-[#2a9099]/10 text-[#2a9099]",
  hvac: "bg-[#3aabb3]/10 text-[#3aabb3]",
  structural: "bg-[#4b6a8a]/10 text-[#4b6a8a]",
  painting: "bg-[#6a8faf]/10 text-[#6a8faf]",
  appliance: "bg-[#2c5f78]/10 text-[#2c5f78]",
  pest_control: "bg-[#5ba3ab]/10 text-[#5ba3ab]",
  other: "bg-[#7a9daf]/10 text-[#7a9daf]",
};

export const categoryBorderClass: Record<RepairCategory, string> = {
  plumbing: "border-l-[#1a6b72]",
  electrical: "border-l-[#2a9099]",
  hvac: "border-l-[#3aabb3]",
  structural: "border-l-[#4b6a8a]",
  painting: "border-l-[#6a8faf]",
  appliance: "border-l-[#2c5f78]",
  pest_control: "border-l-[#5ba3ab]",
  other: "border-l-[#7a9daf]",
};

export const categoryBarClass: Record<RepairCategory, string> = {
  plumbing: "bg-[#1a6b72]",
  electrical: "bg-[#2a9099]",
  hvac: "bg-[#3aabb3]",
  structural: "bg-[#4b6a8a]",
  painting: "bg-[#6a8faf]",
  appliance: "bg-[#2c5f78]",
  pest_control: "bg-[#5ba3ab]",
  other: "bg-[#7a9daf]",
};
