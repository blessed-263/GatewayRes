import { useEffect, useMemo, useState } from "react";
import { Building2, DoorOpen, Layers, MapPin } from "lucide-react";
import { PropertyRoomJobsPanel } from "@/components/properties/PropertyRoomJobsPanel";
import { StatCard } from "@/components/dashboard/StatCard";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRepairs } from "@/context/RepairsContext";
import { propertySites, totalUnitCount } from "@/data/propertyMaster";
import { groupJobsByProperty } from "@/lib/propertyJobs";

const selectTriggerClass =
  "h-12 rounded-xl border-border/70 bg-white text-base shadow-sm sm:h-11 sm:text-sm";

export function PropertiesPage() {
  const { repairs } = useRepairs();
  const [siteId, setSiteId] = useState(propertySites[0]?.id ?? "");
  const [floorId, setFloorId] = useState("");
  const [unitId, setUnitId] = useState("");

  const floorCount = propertySites.reduce((sum, site) => sum + site.floors.length, 0);
  const grouped = useMemo(() => groupJobsByProperty(repairs, propertySites), [repairs]);

  const roomsWithJobs = grouped.reduce(
    (sum, site) =>
      sum +
      site.floors.reduce(
        (fSum, floor) => fSum + floor.rooms.filter((room) => room.jobs.length > 0).length,
        0
      ),
    0
  );

  const activeJobs = grouped.reduce((sum, site) => sum + site.activeCount, 0);

  const selectedSite = useMemo(
    () => grouped.find((site) => site.siteId === siteId),
    [grouped, siteId]
  );

  const selectedFloor = useMemo(
    () => selectedSite?.floors.find((floor) => floor.floorId === floorId),
    [selectedSite, floorId]
  );

  const selectedRoom = useMemo(
    () => selectedFloor?.rooms.find((room) => room.unitId === unitId),
    [selectedFloor, unitId]
  );

  useEffect(() => {
    if (!selectedSite) {
      const first = grouped[0];
      if (first) setSiteId(first.siteId);
      return;
    }
    if (!selectedSite.floors.some((floor) => floor.floorId === floorId)) {
      setFloorId(selectedSite.floors[0]?.floorId ?? "");
    }
  }, [selectedSite, floorId, grouped]);

  useEffect(() => {
    if (!selectedFloor) return;
    if (!selectedFloor.rooms.some((room) => room.unitId === unitId)) {
      setUnitId(selectedFloor.rooms[0]?.unitId ?? "");
    }
  }, [selectedFloor, unitId]);

  function handleSiteChange(nextSiteId: string) {
    setSiteId(nextSiteId);
    const site = grouped.find((entry) => entry.siteId === nextSiteId);
    const firstFloor = site?.floors[0];
    setFloorId(firstFloor?.floorId ?? "");
    setUnitId(firstFloor?.rooms[0]?.unitId ?? "");
  }

  function handleFloorChange(nextFloorId: string) {
    setFloorId(nextFloorId);
    const floor = selectedSite?.floors.find((entry) => entry.floorId === nextFloorId);
    setUnitId(floor?.rooms[0]?.unitId ?? "");
  }

  return (
    <main className="flex-1 space-y-8 p-5 pb-10 sm:p-8 lg:p-10">
      <section className="rounded-[1.75rem] border border-primary/15 bg-primary px-6 py-7 text-primary-foreground sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Properties</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-primary-foreground/85">
          Pick a building, floor, and room to see maintenance jobs for that space.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Sites"
          value={propertySites.length}
          subtitle="Gateway buildings"
          icon={Building2}
          color="primary"
        />
        <StatCard
          title="Floors"
          value={floorCount}
          subtitle="Managed levels"
          icon={Layers}
          color="secondary"
        />
        <StatCard
          title="Rooms & spaces"
          value={totalUnitCount()}
          subtitle="Units in master list"
          icon={DoorOpen}
          color="success"
        />
        <StatCard
          title="Active jobs"
          value={activeJobs}
          subtitle={`${roomsWithJobs} rooms with job history`}
          icon={MapPin}
          color="warning"
        />
      </section>

      <section className="rounded-[1.5rem] border border-border/70 bg-card p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="property-building" className="text-sm font-medium">
              Building
            </Label>
            <Select value={siteId || undefined} onValueChange={handleSiteChange}>
              <SelectTrigger id="property-building" className={selectTriggerClass}>
                <SelectValue placeholder="Select building" />
              </SelectTrigger>
              <SelectContent>
                {grouped.map((site) => (
                  <SelectItem key={site.siteId} value={site.siteId}>
                    {site.building}
                    {site.activeCount > 0 ? ` · ${site.activeCount} active` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="property-floor" className="text-sm font-medium">
              Floor
            </Label>
            <Select
              value={floorId || undefined}
              onValueChange={handleFloorChange}
              disabled={!selectedSite || selectedSite.floors.length === 0}
            >
              <SelectTrigger id="property-floor" className={selectTriggerClass}>
                <SelectValue placeholder="Select floor" />
              </SelectTrigger>
              <SelectContent>
                {selectedSite?.floors.map((floor) => (
                  <SelectItem key={floor.floorId} value={floor.floorId}>
                    {floor.floorName}
                    {floor.jobCount > 0 ? ` · ${floor.jobCount} jobs` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="property-room" className="text-sm font-medium">
              Room / space
            </Label>
            <Select
              value={unitId || undefined}
              onValueChange={setUnitId}
              disabled={!selectedFloor || selectedFloor.rooms.length === 0}
            >
              <SelectTrigger id="property-room" className={selectTriggerClass}>
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                {selectedFloor?.rooms.map((room) => (
                  <SelectItem key={room.unitId} value={room.unitId}>
                    {room.unitCode}
                    {room.jobs.length > 0
                      ? ` · ${room.jobs.length} job${room.jobs.length === 1 ? "" : "s"}`
                      : " · no jobs"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {selectedSite && selectedFloor && selectedRoom ? (
        <PropertyRoomJobsPanel
          building={selectedSite.building}
          room={selectedRoom}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm font-medium">Choose a building, floor, and room</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Maintenance jobs for the selected space will appear here.
          </p>
        </div>
      )}
    </main>
  );
}
