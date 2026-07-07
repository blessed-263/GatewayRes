import { Building2, Layers, DoorOpen } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { propertySites, totalUnitCount } from "@/data/propertyMaster";

export function PropertiesPage() {
  const floorCount = propertySites.reduce((sum, site) => sum + site.floors.length, 0);

  return (
    <>
      <PageHeader
        title="Properties"
        description="Building, floor, and unit hierarchy across Gateway residences."
      />
      <main className="flex-1 space-y-6 p-5 pb-10 sm:p-8 lg:p-10">
        <section className="grid gap-4 md:grid-cols-3">
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
            title="Units & spaces"
            value={totalUnitCount()}
            subtitle="Rooms, common & utility"
            icon={DoorOpen}
            color="success"
          />
        </section>

        <div className="grid gap-5 xl:grid-cols-2">
          {propertySites.map((site) => (
            <section
              key={site.id}
              className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-card shadow-sm"
            >
              <div className="border-b border-border/70 bg-primary/5 px-6 py-5">
                <h2 className="text-xl font-semibold">{site.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{site.address}</p>
              </div>
              <div className="space-y-4 p-6">
                {site.floors.map((floor) => (
                  <div key={floor.id} className="rounded-xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {floor.name}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {floor.units.map((unit) => (
                        <Badge
                          key={unit.id}
                          variant={unit.type === "room" ? "secondary" : "outline"}
                          className="rounded-lg px-2.5 py-1 text-xs"
                        >
                          {unit.code}
                          {unit.beds ? ` · ${unit.beds} bed` : ""}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
