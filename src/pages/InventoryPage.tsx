import { useMemo, useState } from "react";
import { Package, PackageCheck, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRepairs } from "@/context/RepairsContext";
import { partRequestStatusLabels } from "@/lib/partRequestLabels";

export function InventoryPage() {
  const {
    repairs,
    inventoryItems,
    restockInventoryItem,
    allocatePartRequestFromInventory,
  } = useRepairs();

  const [restockQtyByItem, setRestockQtyByItem] = useState<Record<string, string>>({});
  const [selectedInventoryByRequest, setSelectedInventoryByRequest] = useState<Record<string, string>>(
    {}
  );
  const [allocateQtyByRequest, setAllocateQtyByRequest] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pendingRequests = useMemo(
    () =>
      repairs.flatMap((repair) =>
        (repair.partRequests ?? [])
          .filter((request) => request.status === "pending" || request.status === "ordered")
          .map((request) => ({
            repairId: repair.id,
            repairTitle: repair.title,
            unit: repair.unit,
            building: repair.building,
            request,
          }))
      ),
    [repairs]
  );

  const lowStockCount = inventoryItems.filter((item) => item.onHand <= item.reorderLevel).length;
  const totalOnHand = inventoryItems.reduce((sum, item) => sum + item.onHand, 0);
  const allocatedToday = repairs
    .flatMap((repair) => repair.partRequests ?? [])
    .filter((request) => request.allocatedAt?.startsWith(new Date().toISOString().slice(0, 10)))
    .reduce((sum, request) => sum + (request.allocatedQuantity ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Inventory Manager"
        description="Track stock, allocate requested parts, and keep technicians prepared for the day."
      />
      <main className="flex-1 space-y-6 p-5 sm:p-8 lg:p-10">
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Inventory items"
            value={inventoryItems.length}
            subtitle="Managed stock lines"
            icon={Package}
            color="primary"
          />
          <StatCard
            title="Low stock"
            value={lowStockCount}
            subtitle="At or below reorder level"
            icon={TriangleAlert}
            color={lowStockCount > 0 ? "warning" : "success"}
          />
          <StatCard
            title="Allocated today"
            value={allocatedToday}
            subtitle={`Total on hand: ${totalOnHand}`}
            icon={PackageCheck}
            color="secondary"
          />
        </section>

        {error && (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
        )}

        <section className="rounded-[1.5rem] border border-border/70 bg-card p-5">
          <h2 className="text-2xl font-semibold tracking-tight">Inventory tracker</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Restock items and monitor low-stock alerts.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {inventoryItems.map((item) => {
              const lowStock = item.onHand <= item.reorderLevel;
              const qty = restockQtyByItem[item.id] ?? "";
              return (
                <article key={item.id} className="rounded-xl border border-border/70 bg-muted/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.sku} · {item.location}</p>
                    </div>
                    <Badge variant={lowStock ? "destructive" : "secondary"}>
                      {lowStock ? "Low stock" : "Healthy"}
                    </Badge>
                  </div>
                  <p className="mt-3 text-2xl font-semibold tabular-nums">
                    {item.onHand} <span className="text-sm text-muted-foreground">{item.unit}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reorder at {item.reorderLevel} {item.unit}
                  </p>
                  <div className="mt-3 flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                      <Label htmlFor={`restock-${item.id}`} className="text-xs">
                        Restock qty
                      </Label>
                      <Input
                        id={`restock-${item.id}`}
                        type="number"
                        min={1}
                        value={qty}
                        onChange={(event) =>
                          setRestockQtyByItem((prev) => ({ ...prev, [item.id]: event.target.value }))
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      disabled={busy === item.id}
                      onClick={async () => {
                        const quantity = Math.max(1, parseInt(qty, 10) || 0);
                        if (!quantity) return;
                        setBusy(item.id);
                        setError(null);
                        try {
                          await restockInventoryItem(item.id, quantity, "Supervisor");
                          setRestockQtyByItem((prev) => ({ ...prev, [item.id]: "" }));
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Restock failed.");
                        } finally {
                          setBusy(null);
                        }
                      }}
                    >
                      Restock
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-border/70 bg-card p-5">
          <h2 className="text-2xl font-semibold tracking-tight">Part allocation queue</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Allocate requested parts to jobs so workers start with what they need.
          </p>
          {pendingRequests.length === 0 ? (
            <p className="mt-4 rounded-xl border border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
              No pending part requests right now.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {pendingRequests.map((entry) => {
                const request = entry.request;
                const rowKey = `${entry.repairId}:${request.id}`;
                const selectedInventoryId = selectedInventoryByRequest[rowKey] ?? "";
                const qty = allocateQtyByRequest[rowKey] ?? String(request.quantity);

                return (
                  <article key={rowKey} className="rounded-xl border border-border/70 bg-muted/20 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          {request.quantity}× {request.partName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.repairTitle} · {entry.unit} · {entry.building}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Status: {partRequestStatusLabels[request.status]}
                        </p>
                      </div>
                      <Badge variant="outline">{request.requestedKind === "tool" ? "Tool" : "Part"}</Badge>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-[1fr_120px_auto]">
                      <Select
                        value={selectedInventoryId}
                        onValueChange={(value) =>
                          setSelectedInventoryByRequest((prev) => ({ ...prev, [rowKey]: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select inventory item" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} · {item.onHand} {item.unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min={1}
                        value={qty}
                        onChange={(event) =>
                          setAllocateQtyByRequest((prev) => ({ ...prev, [rowKey]: event.target.value }))
                        }
                      />
                      <Button
                        type="button"
                        disabled={busy === rowKey || !selectedInventoryId}
                        onClick={async () => {
                          setBusy(rowKey);
                          setError(null);
                          try {
                            await allocatePartRequestFromInventory(
                              entry.repairId,
                              request.id,
                              selectedInventoryId,
                              Math.max(1, parseInt(qty, 10) || request.quantity),
                              "Supervisor"
                            );
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Allocation failed.");
                          } finally {
                            setBusy(null);
                          }
                        }}
                      >
                        Allocate
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
