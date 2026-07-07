import { useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useOperations } from "@/context/OperationsContext";
import { buildingNames } from "@/data/propertyMaster";
import { categoryLabels, priorityLabels } from "@/lib/repairLabels";
import { formatZar } from "@/lib/budgetConfig";
import { ClipboardList } from "lucide-react";

export function TemplatesPage() {
  const { user } = useAuth();
  const { jobTemplates, createRepairFromTemplate } = useOperations();
  const [selectedTemplate, setSelectedTemplate] = useState(jobTemplates[0]?.id ?? "");
  const [building, setBuilding] = useState<string>(buildingNames[0]);
  const [unit, setUnit] = useState("B204");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const template = jobTemplates.find((t) => t.id === selectedTemplate);

  async function handleCreate() {
    if (!selectedTemplate || !unit.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      const repair = await createRepairFromTemplate(
        selectedTemplate,
        unit.trim(),
        building,
        user?.name ?? "Supervisor"
      );
      setMessage(`Created ${repair.id} from template.`);
    } catch {
      setMessage("Could not create task.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Job Templates"
        description="Standard fixes per category and building — create consistent work orders in one click."
      />
      <main className="flex-1 space-y-6 p-5 pb-10 sm:p-8 lg:p-10">
        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {jobTemplates.map((tpl) => (
              <article
                key={tpl.id}
                className="rounded-[1.5rem] border border-border/70 bg-card p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">{tpl.name}</h2>
                  <Badge variant="outline">{categoryLabels[tpl.category]}</Badge>
                  <Badge variant="secondary">{priorityLabels[tpl.defaultPriority]}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{tpl.description}</p>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {tpl.checklist.map((step) => (
                    <li key={step}>• {step}</li>
                  ))}
                </ul>
                <p className="mt-3 text-sm">
                  {tpl.estimatedCost ? formatZar(tpl.estimatedCost) : "—"}
                  {tpl.defaultAssignee ? ` · Default: ${tpl.defaultAssignee}` : ""}
                  {tpl.building ? ` · ${tpl.building}` : ""}
                </p>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-[1.5rem] border border-primary/15 bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2 text-primary">
              <ClipboardList className="h-5 w-5" />
              <h2 className="font-semibold">Create from template</h2>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Template
                </label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="mt-1 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTemplates.map((tpl) => (
                      <SelectItem key={tpl.id} value={tpl.id}>
                        {tpl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Building
                </label>
                <Select value={building} onValueChange={setBuilding}>
                  <SelectTrigger className="mt-1 h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {buildingNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Unit
                </label>
                <input
                  className="mt-1 flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
              {template ? (
                <p className="text-xs text-muted-foreground">
                  Will create a {priorityLabels[template.defaultPriority]} {categoryLabels[template.category]} task.
                </p>
              ) : null}
              <Button className="w-full rounded-xl" onClick={handleCreate} disabled={busy}>
                {busy ? "Creating…" : "Create task"}
              </Button>
              {message ? <p className="text-sm text-primary">{message}</p> : null}
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}
