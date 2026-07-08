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
  plumbing: "bg-[#1F5F49]/10 text-[#1F5F49]",
  electrical: "bg-[#3A8F6E]/10 text-[#3A8F6E]",
  hvac: "bg-[#55B896]/10 text-[#55B896]",
  structural: "bg-[#2D7259]/10 text-[#2D7259]",
  painting: "bg-[#F7941D]/10 text-[#F7941D]",
  appliance: "bg-[#6BC4A8]/10 text-[#6BC4A8]",
  pest_control: "bg-[#8FD4BC]/10 text-[#8FD4BC]",
  other: "bg-[#7BDCB5]/10 text-[#7BDCB5]",
};

export const categoryBorderClass: Record<RepairCategory, string> = {
  plumbing: "border-l-[#1F5F49]",
  electrical: "border-l-[#3A8F6E]",
  hvac: "border-l-[#55B896]",
  structural: "border-l-[#2D7259]",
  painting: "border-l-[#F7941D]",
  appliance: "border-l-[#6BC4A8]",
  pest_control: "border-l-[#8FD4BC]",
  other: "border-l-[#7BDCB5]",
};

export const categoryBarClass: Record<RepairCategory, string> = {
  plumbing: "bg-[#1F5F49]",
  electrical: "bg-[#3A8F6E]",
  hvac: "bg-[#55B896]",
  structural: "bg-[#2D7259]",
  painting: "bg-[#F7941D]",
  appliance: "bg-[#6BC4A8]",
  pest_control: "bg-[#8FD4BC]",
  other: "bg-[#7BDCB5]",
};
