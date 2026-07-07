import { useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  partRequestBadgeVariant,
  partRequestStatusLabels,
} from "@/lib/partRequestLabels";
import { formatDate } from "@/lib/utils";
import type {
  CreatePartRequestInput,
  PartRequestKind,
  PartRequest,
  PartRequestStatus,
} from "@/types/repair";

interface RepairPartRequestsProps {
  repairId: string;
  partRequests: PartRequest[];
  readOnly?: boolean;
  canManageStatus?: boolean;
  defaultRequester?: string;
  onSubmit: (input: CreatePartRequestInput) => Promise<void>;
  onStatusChange?: (partRequestId: string, status: PartRequestStatus) => Promise<void>;
}

const statuses: PartRequestStatus[] = ["pending", "ordered", "received", "cancelled"];

export function RepairPartRequests({
  repairId,
  partRequests,
  readOnly = false,
  canManageStatus = false,
  defaultRequester = "Staff",
  onSubmit,
  onStatusChange,
}: RepairPartRequestsProps) {
  const [partName, setPartName] = useState("");
  const [requestedKind, setRequestedKind] = useState<PartRequestKind>("part");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [supplier, setSupplier] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [markAwaitingParts, setMarkAwaitingParts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!partName.trim()) {
      setError("Enter a part name.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        requestedKind,
        partName: partName.trim(),
        description: description.trim() || undefined,
        quantity: Math.max(1, parseInt(quantity, 10) || 1),
        supplier: supplier.trim() || undefined,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        markAwaitingParts,
      });
      setPartName("");
      setRequestedKind("part");
      setDescription("");
      setQuantity("1");
      setSupplier("");
      setEstimatedCost("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit part request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {!readOnly && (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Request a part</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`part-name-${repairId}`}>Part name</Label>
              <Input
                id={`part-name-${repairId}`}
                placeholder="e.g. Kitchen tap cartridge"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Request type</Label>
              <Select
                value={requestedKind}
                onValueChange={(value) => setRequestedKind(value as PartRequestKind)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="part">Part</SelectItem>
                  <SelectItem value="tool">Tool</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`part-qty-${repairId}`}>Quantity</Label>
              <Input
                id={`part-qty-${repairId}`}
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`part-supplier-${repairId}`}>Supplier (optional)</Label>
              <Input
                id={`part-supplier-${repairId}`}
                placeholder="Hardware store"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`part-desc-${repairId}`}>Notes</Label>
              <Textarea
                id={`part-desc-${repairId}`}
                placeholder="Size, model, or where to source it"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[72px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`part-cost-${repairId}`}>Est. cost (ZAR)</Label>
              <Input
                id={`part-cost-${repairId}`}
                type="number"
                min={0}
                step="0.01"
                placeholder="Optional"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={markAwaitingParts}
              onChange={(e) => setMarkAwaitingParts(e.target.checked)}
              className="rounded border-input"
            />
            Mark job as awaiting parts
          </label>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? "Submitting…" : "Submit part request"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Requested as {defaultRequester}. Supervisors can track and fulfil orders from Analytics.
          </p>
        </form>
      )}

      {partRequests.length === 0 ? (
        <p className="text-sm text-muted-foreground">No part requests yet.</p>
      ) : (
        <ul className="space-y-3">
          {partRequests.map((part) => (
            <li
              key={part.id}
              className="rounded-xl border border-border/60 bg-card p-3.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium">
                    {part.quantity}× {part.partName}
                  </p>
                  {part.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{part.description}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {part.requestedKind === "tool" ? "Tool" : "Part"} ·{" "}
                    {part.requestedBy} · {formatDate(part.requestedAt)}
                    {part.supplier ? ` · ${part.supplier}` : ""}
                    {part.estimatedCost != null ? ` · ~R${part.estimatedCost}` : ""}
                  </p>
                </div>
                {canManageStatus && onStatusChange ? (
                  <Select
                    value={part.status}
                    onValueChange={(v) =>
                      void onStatusChange(part.id, v as PartRequestStatus)
                    }
                  >
                    <SelectTrigger className="h-9 w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {partRequestStatusLabels[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={partRequestBadgeVariant(part.status)}>
                    {partRequestStatusLabels[part.status]}
                  </Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {canManageStatus && (
        <p className="text-xs text-muted-foreground">
          <Link to="/analytics" className="font-medium text-primary hover:underline">
            View all part requests in Analytics →
          </Link>
        </p>
      )}
    </div>
  );
}
