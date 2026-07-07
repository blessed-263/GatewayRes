import type { Contractor } from "@/types/operations";

export const contractors: Contractor[] = [
  {
    id: "ctr-electrical",
    slug: "jhb-electrical",
    name: "JHB Electrical Services",
    trade: "Electrical specialist",
    contactEmail: "jobs@gateway-electrical.demo",
    buildings: ["All sites"],
    active: true,
    invoices: [
      {
        id: "inv-001",
        repairId: "GR-2403",
        amount: 4800,
        description: "DB board replacement — Lascelles 201",
        status: "pending",
        submittedAt: "2026-06-20T10:00:00Z",
      },
    ],
  },
  {
    id: "ctr-glazing",
    slug: "gateway-glass",
    name: "Gateway Glass & Glazing",
    trade: "Windows & glass",
    contactEmail: "quotes@gateway-glass.demo",
    buildings: ["All sites"],
    active: true,
    invoices: [],
  },
  {
    id: "ctr-pest",
    slug: "pestshield-sa",
    name: "PestShield SA",
    trade: "Pest control",
    contactEmail: "service@gateway-pest.demo",
    buildings: ["Genesis", "Lascelles"],
    active: true,
    invoices: [
      {
        id: "inv-002",
        repairId: "GR-2401",
        amount: 3200,
        description: "Quarterly treatment — Genesis block B",
        status: "paid",
        submittedAt: "2026-05-15T08:00:00Z",
        paidAt: "2026-05-28T14:00:00Z",
      },
    ],
  },
];

export function getContractorById(id: string) {
  return contractors.find((c) => c.id === id);
}

export function getContractorBySlug(slug: string) {
  return contractors.find((c) => c.slug === slug);
}
