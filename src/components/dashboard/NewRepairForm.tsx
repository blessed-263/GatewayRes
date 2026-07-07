import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { FileUploadField } from "@/components/dashboard/FileUploadField";
import { useAuth } from "@/context/AuthContext";
import { categoryLabels } from "@/lib/repairLabels";
import type {
  Building,
  CreateRepairInput,
  Repair,
  RepairCategory,
  RepairPriority,
} from "@/types/repair";

const buildings: Building[] = [
  "Genesis",
  "Lascelles",
  "Truman House",
  "Claim Street Main",
];

const categories: RepairCategory[] = [
  "plumbing",
  "electrical",
  "hvac",
  "structural",
  "appliance",
  "pest_control",
  "painting",
  "other",
];

interface NewRepairFormProps {
  onSubmit: (input: CreateRepairInput, files: File[]) => Promise<void | Repair>;
  redirectTo?: string;
  submitLabel?: string;
}

export function NewRepairForm({
  onSubmit,
  redirectTo,
  submitLabel = "Submit Repair Request",
}: NewRepairFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unit, setUnit] = useState("");
  const [building, setBuilding] = useState<Building>("Genesis");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<RepairCategory>("other");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [priority, setPriority] = useState<RepairPriority>("medium");
  const [reportedBy, setReportedBy] = useState("");
  const [residentPhone, setResidentPhone] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const cost = estimatedCost ? parseFloat(estimatedCost) : undefined;
    const input: CreateRepairInput = {
      unit,
      building,
      title,
      description,
      category,
      priority,
      reportedBy,
      loggedBy: user?.name,
      ...(residentPhone && { residentPhone }),
      ...(cost != null && !Number.isNaN(cost) && { estimated_cost: cost }),
    };

    try {
      await onSubmit(input, files);
      if (redirectTo) navigate(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit repair");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <section className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Location</h3>
          <p className="text-sm text-muted-foreground">Where should the maintenance team go?</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            className="h-12 text-base"
            placeholder="e.g. B204"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Building</Label>
          <Select
            value={building}
            onValueChange={(v) => setBuilding(v as Building)}
          >
            <SelectTrigger className="h-12 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {buildings.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">Issue details</h3>
        <p className="text-sm text-muted-foreground">Describe the problem and attach useful evidence.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Issue Title</Label>
        <Input
          id="title"
          className="h-12 text-base"
          placeholder="Brief description"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Details</Label>
        <Textarea
          id="description"
          className="min-h-32 text-base"
          placeholder="Full description for maintenance team"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <FileUploadField
        files={files}
        onChange={setFiles}
        label="Photos of the issue"
        hint="Add photos or documents to help the maintenance team (optional)"
      />
      </section>

      <section className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">Triage</h3>
        <p className="text-sm text-muted-foreground">Set priority and budget hints before scheduling.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as RepairCategory)}
          >
            <SelectTrigger className="h-12 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {categoryLabels[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={priority}
            onValueChange={(v) => setPriority(v as RepairPriority)}
          >
            <SelectTrigger className="h-12 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="estimatedCost">Estimated Cost (ZAR)</Label>
        <Input
          id="estimatedCost"
          className="h-12 text-base"
          type="number"
          min="0"
          step="0.01"
          placeholder="e.g. 850"
          value={estimatedCost}
          onChange={(e) => setEstimatedCost(e.target.value)}
        />
      </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border/70 bg-card p-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">Resident contact</h3>
        <p className="text-sm text-muted-foreground">Who should reception or maintenance follow up with?</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="reportedBy">Student name</Label>
          <Input
            id="reportedBy"
            className="h-12 text-base"
            placeholder="e.g. Lerato K."
            value={reportedBy}
            onChange={(e) => setReportedBy(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Who the issue is for, logged under your account for follow-up.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="residentPhone">Contact phone</Label>
          <Input
            id="residentPhone"
            className="h-12 text-base"
            type="tel"
            placeholder="+27 …"
            value={residentPhone}
            onChange={(e) => setResidentPhone(e.target.value)}
          />
        </div>
      </div>
      </section>

      <Button type="submit" className="h-12 w-full rounded-xl px-6 text-base font-semibold sm:w-auto" disabled={submitting}>
        {submitting ? "Submitting…" : submitLabel}
      </Button>
    </form>
  );
}
