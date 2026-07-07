export interface TeamProfile {
  slug: string;
  name: string;
  role: string;
  workType: string;
  joinedAt: string;
  skills: string[];
  buildings: string[];
  avatarUrl: string;
}

export const teamProfiles: TeamProfile[] = [
  {
    slug: "sipho-n",
    name: "Sipho N.",
    role: "Lead Plumber",
    workType: "Plumbing repairs",
    joinedAt: "2022-03-12",
    skills: ["Leak diagnostics", "Pipe replacement", "Fixture fitting"],
    buildings: ["Genesis", "Claim Street Main"],
    avatarUrl: "/images/maintenance-worker.jpg",
  },
  {
    slug: "maintenance-team-a",
    name: "Maintenance Team A",
    role: "General Repairs",
    workType: "Daily maintenance",
    joinedAt: "2021-09-01",
    skills: ["General fixes", "Basic carpentry", "Site checks"],
    buildings: ["Genesis", "Lascelles"],
    avatarUrl: "/images/maintenance-worker.jpg",
  },
  {
    slug: "maintenance-team-b",
    name: "Maintenance Team B",
    role: "Furniture & Fixtures",
    workType: "Interior fixtures",
    joinedAt: "2023-01-20",
    skills: ["Wardrobe repairs", "Door hinges", "Furniture assembly"],
    buildings: ["Truman House"],
    avatarUrl: "/images/maintenance-worker.jpg",
  },
  {
    slug: "electrical-contractor",
    name: "Electrical Contractor",
    role: "Electrical Specialist",
    workType: "Electrical maintenance",
    joinedAt: "2020-06-15",
    skills: ["Socket replacement", "Circuit checks", "Safety testing"],
    buildings: ["All sites"],
    avatarUrl: "/images/maintenance-worker.jpg",
  },
  {
    slug: "security-maintenance",
    name: "Security Maintenance",
    role: "Locks & Access",
    workType: "Access systems",
    joinedAt: "2021-11-08",
    skills: ["Lock repairs", "Door alignment", "Access fitting"],
    buildings: ["Lascelles", "Claim Street Main"],
    avatarUrl: "/images/maintenance-worker.jpg",
  },
  {
    slug: "glazing-contractor",
    name: "Glazing Contractor",
    role: "Windows & Glass",
    workType: "Glass and window works",
    joinedAt: "2019-04-27",
    skills: ["Glass replacement", "Window sealing", "Frame adjustments"],
    buildings: ["All sites"],
    avatarUrl: "/images/maintenance-worker.jpg",
  },
];

export function getTeamProfileBySlug(slug: string) {
  return teamProfiles.find((member) => member.slug === slug);
}
