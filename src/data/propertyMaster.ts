import type { PropertySite } from "@/types/operations";

export const propertySites: PropertySite[] = [
  {
    id: "site-genesis",
    name: "Genesis",
    slug: "genesis",
    address: "30 Claim Street, Doornfontein",
    floors: [
      {
        id: "gen-f1",
        name: "Ground floor",
        units: [
          { id: "gen-g-lobby", code: "Lobby", type: "common" },
          { id: "gen-g-laundry", code: "Laundry", type: "utility" },
        ],
      },
      {
        id: "gen-f2",
        name: "Floor 2",
        units: [
          { id: "gen-201", code: "201", type: "room", beds: 2 },
          { id: "gen-202", code: "202", type: "room", beds: 2 },
          { id: "gen-b204", code: "B204", type: "room", beds: 2 },
        ],
      },
      {
        id: "gen-f3",
        name: "Floor 3",
        units: [
          { id: "gen-301", code: "301", type: "room", beds: 2 },
          { id: "gen-302", code: "302", type: "room", beds: 2 },
        ],
      },
    ],
  },
  {
    id: "site-lascelles",
    name: "Lascelles",
    slug: "lascelles",
    address: "Lascelles Street, Hillbrow",
    floors: [
      {
        id: "las-f1",
        name: "Floor 1",
        units: [
          { id: "las-101", code: "101", type: "room", beds: 2 },
          { id: "las-102", code: "102", type: "room", beds: 2 },
        ],
      },
      {
        id: "las-f2",
        name: "Floor 2",
        units: [
          { id: "las-201", code: "201", type: "room", beds: 2 },
          { id: "las-202", code: "202", type: "room", beds: 2 },
        ],
      },
    ],
  },
  {
    id: "site-truman",
    name: "Truman House",
    slug: "truman-house",
    address: "Truman Road, Johannesburg",
    floors: [
      {
        id: "tru-f1",
        name: "Floor 1",
        units: [
          { id: "tru-101", code: "101", type: "room", beds: 2 },
          { id: "tru-102", code: "102", type: "room", beds: 2 },
        ],
      },
    ],
  },
  {
    id: "site-claim",
    name: "Claim Street Main",
    slug: "claim-street-main",
    address: "Claim Street, Doornfontein",
    floors: [
      {
        id: "clm-f1",
        name: "Ground floor",
        units: [
          { id: "clm-g-recv", code: "Reception", type: "common" },
          { id: "clm-101", code: "101", type: "room", beds: 2 },
        ],
      },
      {
        id: "clm-f2",
        name: "Floor 2",
        units: [
          { id: "clm-201", code: "201", type: "room", beds: 2 },
          { id: "clm-202", code: "202", type: "room", beds: 2 },
        ],
      },
    ],
  },
];

export const buildingNames = propertySites.map((site) => site.name) as readonly string[];

export type Building = (typeof buildingNames)[number];

export function getSiteByName(name: string) {
  return propertySites.find((site) => site.name === name);
}

export function unitsForBuilding(buildingName: string) {
  const site = getSiteByName(buildingName);
  if (!site) return [];
  return site.floors.flatMap((floor) => floor.units);
}

export function totalUnitCount() {
  return propertySites.reduce(
    (sum, site) => sum + site.floors.reduce((fSum, floor) => fSum + floor.units.length, 0),
    0
  );
}
