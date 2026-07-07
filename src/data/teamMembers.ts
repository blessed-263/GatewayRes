import { teamProfiles } from "@/data/teamProfiles";

export const assignableMembers = teamProfiles.map((member) => member.name);
export const teamMembers = [...assignableMembers, "Unassigned"] as const;
