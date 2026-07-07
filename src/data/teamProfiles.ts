export type TeamDepartment =
  | "plumbing"
  | "electrical"
  | "general"
  | "structural"
  | "contractors";

export interface TeamDepartmentInfo {
  id: TeamDepartment;
  label: string;
  description: string;
}

export const teamDepartments: TeamDepartmentInfo[] = [
  {
    id: "plumbing",
    label: "Plumbing",
    description: "Water, drainage, and bathroom repairs",
  },
  {
    id: "electrical",
    label: "Electrical",
    description: "Power, lighting, and wiring faults",
  },
  {
    id: "general",
    label: "General Maintenance",
    description: "Day-to-day repairs and access work",
  },
  {
    id: "structural",
    label: "Structural & Fixtures",
    description: "Furniture, doors, windows, and fittings",
  },
  {
    id: "contractors",
    label: "External Contractors",
    description: "Specialist vendors for scoped work",
  },
];

export interface TeamProfile {
  slug: string;
  name: string;
  department: TeamDepartment;
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
    department: "plumbing",
    role: "Lead Plumber",
    workType: "Plumbing repairs",
    joinedAt: "2022-03-12",
    skills: ["Leak diagnostics", "Pipe replacement", "Fixture fitting"],
    buildings: ["Genesis", "Claim Street Main"],
    avatarUrl: "/images/gateway-residence.jpg",
  },
  {
    slug: "given-k",
    name: "Given K.",
    department: "general",
    role: "General Technician",
    workType: "Daily maintenance",
    joinedAt: "2021-09-01",
    skills: ["General fixes", "HVAC servicing", "Site checks"],
    buildings: ["Genesis", "Lascelles"],
    avatarUrl: "/images/gateway-residence.jpg",
  },
  {
    slug: "james-m",
    name: "James M.",
    department: "structural",
    role: "Furniture & Fixtures",
    workType: "Interior fixtures",
    joinedAt: "2023-01-20",
    skills: ["Wardrobe repairs", "Door hinges", "Furniture assembly"],
    buildings: ["Truman House"],
    avatarUrl: "/images/gateway-residence.jpg",
  },
  {
    slug: "lerato-m",
    name: "Lerato M.",
    department: "electrical",
    role: "Electrician",
    workType: "Electrical maintenance",
    joinedAt: "2020-06-15",
    skills: ["Socket replacement", "Circuit checks", "Safety testing"],
    buildings: ["All sites"],
    avatarUrl: "/images/gateway-residence.jpg",
  },
  {
    slug: "zanele-r",
    name: "Zanele R.",
    department: "general",
    role: "Locks & Access",
    workType: "Access systems",
    joinedAt: "2021-11-08",
    skills: ["Lock repairs", "Door alignment", "Pest walkthroughs"],
    buildings: ["Lascelles", "Claim Street Main"],
    avatarUrl: "/images/gateway-residence.jpg",
  },
  {
    slug: "david-w",
    name: "David W.",
    department: "contractors",
    role: "Glazier",
    workType: "Glass and window works",
    joinedAt: "2019-04-27",
    skills: ["Glass replacement", "Window sealing", "Frame adjustments"],
    buildings: ["All sites"],
    avatarUrl: "/images/gateway-residence.jpg",
  },
];

export function getTeamProfileBySlug(slug: string) {
  return teamProfiles.find((member) => member.slug === slug);
}

export function getDepartmentInfo(id: TeamDepartment) {
  return teamDepartments.find((dept) => dept.id === id);
}

export function membersByDepartment(department: TeamDepartment | "all") {
  if (department === "all") return teamProfiles;
  return teamProfiles.filter((member) => member.department === department);
}

export function getTeamProfileByName(name: string) {
  return teamProfiles.find((member) => member.name === name);
}
