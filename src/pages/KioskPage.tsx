import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Home, Info, Printer, Wrench } from "lucide-react";
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
import { useRepairs } from "@/context/RepairsContext";
import { categoryLabels } from "@/lib/repairLabels";
import { cn } from "@/lib/utils";
import type {
  Building,
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

const priorities: { value: RepairPriority; label: string; hint: string }[] = [
  { value: "low", label: "Low", hint: "Can wait" },
  { value: "medium", label: "Normal", hint: "Standard repair" },
  { value: "high", label: "High", hint: "Needs attention soon" },
  { value: "urgent", label: "Urgent", hint: "Safety or access issue" },
];

type KioskStep = 0 | 1 | 2;

export function KioskPage() {
  const { addRepair } = useRepairs();
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState<KioskStep>(0);
  const [submittedRepair, setSubmittedRepair] = useState<Repair | null>(null);

  const [studentName, setStudentName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [building, setBuilding] = useState<Building>("Genesis");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState<RepairCategory>("plumbing");
  const [priority, setPriority] = useState<RepairPriority>("medium");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roomStepComplete = studentName.trim() && unit.trim();
  const problemStepComplete = description.trim().length >= 10;
  const canSubmit = roomStepComplete && problemStepComplete;

  const issueTitle = useMemo(() => {
    const label = categoryLabels[category] ?? "Maintenance";
    const trimmedUnit = unit.trim();
    return trimmedUnit ? `${label} issue in ${trimmedUnit}` : `${label} maintenance query`;
  }, [category, unit]);

  function resetKiosk() {
    setStarted(false);
    setStep(0);
    setSubmittedRepair(null);
    setStudentName("");
    setContactPhone("");
    setBuilding("Genesis");
    setUnit("");
    setCategory("plumbing");
    setPriority("medium");
    setDescription("");
    setFiles([]);
    setSubmitting(false);
    setError(null);
  }

  async function submitRequest() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const repair = await addRepair(
        {
          unit: unit.trim(),
          building,
          title: issueTitle,
          description: description.trim(),
          category,
          priority,
          reportedBy: studentName.trim(),
          loggedBy: "Gateway Kiosk",
          ...(contactPhone.trim() && { residentPhone: contactPhone.trim() }),
        },
        files
      );
      setSubmittedRepair(repair);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="kiosk-page min-h-[100dvh] bg-[#f6f6f3] text-slate-950">
      <KioskHeader />

      <main className="kiosk-print-shell mx-auto flex w-full max-w-6xl flex-1 px-6 py-8 lg:px-8">
        {!started ? (
          <WelcomeScreen onStart={() => setStarted(true)} />
        ) : submittedRepair ? (
          <SuccessScreen
            repair={submittedRepair}
            onReset={resetKiosk}
            onPrint={() => window.print()}
          />
        ) : (
          <div className="w-full space-y-6">
            <div>
              <p className="text-sm font-medium text-primary">Central Maintenance Request</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                Log a maintenance query
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Use this front-desk terminal to submit a maintenance issue. You will receive a
                reference number after submission.
              </p>
            </div>

            <StepIndicator step={step} />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section className="rounded-2xl border border-border/70 bg-white shadow-sm">
                <div className="p-6 sm:p-7">
                  {step === 0 && (
                    <RoomDetailsStep
                      studentName={studentName}
                      setStudentName={setStudentName}
                      contactPhone={contactPhone}
                      setContactPhone={setContactPhone}
                      building={building}
                      setBuilding={setBuilding}
                      unit={unit}
                      setUnit={setUnit}
                    />
                  )}

                  {step === 1 && (
                    <ProblemDetailsStep
                      category={category}
                      setCategory={setCategory}
                      priority={priority}
                      setPriority={setPriority}
                      description={description}
                      setDescription={setDescription}
                      files={files}
                      setFiles={setFiles}
                    />
                  )}

                  {step === 2 && (
                    <ReviewStep
                      studentName={studentName}
                      contactPhone={contactPhone}
                      building={building}
                      unit={unit}
                      category={category}
                      priority={priority}
                      description={description}
                      files={files}
                    />
                  )}

                  {error && (
                    <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {error}
                    </p>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-border/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-lg"
                    onClick={() => {
                      if (step === 0) {
                        resetKiosk();
                      } else {
                        setStep((current) => (current - 1) as KioskStep);
                      }
                    }}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {step === 0 ? "Cancel" : "Back"}
                  </Button>

                  {step < 2 ? (
                    <Button
                      type="button"
                      className="h-11 rounded-lg"
                      disabled={step === 0 ? !roomStepComplete : !problemStepComplete}
                      onClick={() => setStep((current) => (current + 1) as KioskStep)}
                    >
                      {step === 0 ? "Continue" : "Review request"}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="h-11 rounded-lg"
                      disabled={!canSubmit || submitting}
                      onClick={() => void submitRequest()}
                    >
                      {submitting ? "Submitting..." : "Submit request"}
                    </Button>
                  )}
                </div>
              </section>

              <HelpPanel />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function KioskHeader() {
  return (
    <header className="kiosk-no-print bg-primary text-primary-foreground">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-semibold tracking-tight">Gateway</span>
            <span className="h-2 w-2 rounded-full bg-cyan-300" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
            Student Residences
          </p>
        </div>
        <Link
          to="/"
          className="hidden items-center gap-2 text-sm font-medium text-white/85 transition-colors hover:text-white sm:flex"
        >
          <Home className="h-4 w-4" />
          All interfaces
        </Link>
      </div>
    </header>
  );
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="grid min-h-[calc(100dvh-8rem)] w-full place-items-center">
      <section className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border/70 bg-white p-8 text-center shadow-lg shadow-black/5 sm:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary text-primary">
          <Wrench className="h-9 w-9" strokeWidth={1.8} />
        </div>
        <h1 className="mt-7 text-4xl font-semibold tracking-tight text-slate-950">
          Maintenance Query Kiosk
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
          Log a maintenance issue at the front desk terminal. A reference number will be
          generated for follow-up at reception.
        </p>
        <Button type="button" size="lg" className="mt-8 h-14 rounded-lg px-12 text-lg" onClick={onStart}>
          Start a new request
        </Button>
        <p className="mt-6 text-sm text-muted-foreground">
          For urgent safety issues, notify reception immediately.
        </p>
      </section>
    </div>
  );
}

function StepIndicator({ step }: { step: KioskStep }) {
  const steps = ["Room details", "Problem details", "Review"];
  return (
    <ol className="grid gap-3 sm:grid-cols-3">
      {steps.map((label, index) => (
        <li key={label} className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
              index === step
                ? "bg-primary text-primary-foreground"
                : index < step
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
            )}
          >
            {index < step ? <Check className="h-4 w-4" /> : index + 1}
          </span>
          <span className={cn("text-sm font-medium", index === step && "text-primary")}>
            {label}
          </span>
          {index < steps.length - 1 && (
            <span className="hidden h-px flex-1 bg-border sm:block" />
          )}
        </li>
      ))}
    </ol>
  );
}

function RoomDetailsStep({
  studentName,
  setStudentName,
  contactPhone,
  setContactPhone,
  building,
  setBuilding,
  unit,
  setUnit,
}: {
  studentName: string;
  setStudentName: (value: string) => void;
  contactPhone: string;
  setContactPhone: (value: string) => void;
  building: Building;
  setBuilding: (value: Building) => void;
  unit: string;
  setUnit: (value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Room details</h2>
        <p className="text-sm text-muted-foreground">
          Tell us who is reporting the issue and where the problem is located.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Student name" htmlFor="studentName">
          <Input
            id="studentName"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="e.g. John Smith"
            className="h-11"
            autoFocus
          />
        </Field>
        <Field label="Contact number" htmlFor="contactPhone">
          <Input
            id="contactPhone"
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="e.g. 071 234 5678"
            className="h-11"
          />
        </Field>
        <Field label="Building">
          <Select value={building} onValueChange={(value) => setBuilding(value as Building)}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {buildings.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Room / Unit" htmlFor="unit">
          <Input
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value.toUpperCase())}
            placeholder="e.g. GWH-305"
            className="h-11"
          />
        </Field>
      </div>
    </div>
  );
}

function ProblemDetailsStep({
  category,
  setCategory,
  priority,
  setPriority,
  description,
  setDescription,
  files,
  setFiles,
}: {
  category: RepairCategory;
  setCategory: (value: RepairCategory) => void;
  priority: RepairPriority;
  setPriority: (value: RepairPriority) => void;
  description: string;
  setDescription: (value: string) => void;
  files: File[];
  setFiles: (files: File[]) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Problem details</h2>
        <p className="text-sm text-muted-foreground">
          Describe the issue clearly so maintenance can route it correctly.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Problem category">
          <Select value={category} onValueChange={(value) => setCategory(value as RepairCategory)}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((item) => (
                <SelectItem key={item} value={item}>
                  {categoryLabels[item]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Urgency">
          <Select value={priority} onValueChange={(value) => setPriority(value as RepairPriority)}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label} - {item.hint}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field label="Describe the issue" htmlFor="description">
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Example: There is a leak under the kitchen sink. Water is pooling in the cupboard."
          className="min-h-[120px]"
        />
      </Field>
      <FileUploadField
        id="kiosk-photos"
        files={files}
        onChange={setFiles}
        accept="image/*"
        label="Add photos of the problem"
        hint="JPG or PNG photos help maintenance assess the damage faster"
      />
    </div>
  );
}

function ReviewStep({
  studentName,
  contactPhone,
  building,
  unit,
  category,
  priority,
  description,
  files,
}: {
  studentName: string;
  contactPhone: string;
  building: Building;
  unit: string;
  category: RepairCategory;
  priority: RepairPriority;
  description: string;
  files: File[];
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Review request</h2>
        <p className="text-sm text-muted-foreground">
          Check the details before submitting. Reception can use the reference number for follow-up.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ReviewItem label="Student" value={studentName} />
        <ReviewItem label="Contact" value={contactPhone || "Not provided"} />
        <ReviewItem label="Location" value={`${unit} · ${building}`} />
        <ReviewItem label="Category" value={categoryLabels[category]} />
        <ReviewItem
          label="Urgency"
          value={priorities.find((item) => item.value === priority)?.label ?? priority}
        />
        <ReviewItem label="Photos" value={`${files.length} attached`} />
      </div>
      <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Description
        </p>
        <p className="mt-2 text-sm leading-6">{description}</p>
      </div>
    </div>
  );
}

function SuccessScreen({
  repair,
  onReset,
  onPrint,
}: {
  repair: Repair;
  onReset: () => void;
  onPrint: () => void;
}) {
  return (
    <div className="grid min-h-[calc(100dvh-8rem)] w-full place-items-center">
      <section className="kiosk-print-receipt grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border/70 bg-white shadow-lg shadow-black/5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="p-8 text-center sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary text-primary">
            <Check className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-primary">
            Request submitted
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your maintenance request has been received.
          </p>

          <div className="mx-auto mt-7 max-w-md border-y border-border/70 py-5">
            <p className="text-sm text-muted-foreground">Reference number</p>
            <p className="mt-1 font-mono text-3xl font-semibold text-primary">
              {repair.id}
            </p>
          </div>

          <dl className="mx-auto mt-5 grid max-w-sm grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-left text-sm">
            <dt className="text-muted-foreground">Student:</dt>
            <dd className="font-medium">{repair.reportedBy}</dd>
            <dt className="text-muted-foreground">Unit:</dt>
            <dd className="font-medium">{repair.unit}</dd>
            <dt className="text-muted-foreground">Category:</dt>
            <dd className="font-medium">{categoryLabels[repair.category]}</dd>
            <dt className="text-muted-foreground">Status:</dt>
            <dd className="font-medium text-primary">Open</dd>
          </dl>

          <p className="mt-6 text-sm text-muted-foreground">
            Please keep this reference number for follow-up at reception.
          </p>
          <div className="kiosk-no-print mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button type="button" className="h-11 rounded-lg" onClick={onReset}>
              Start new request
            </Button>
            <Button type="button" variant="outline" className="h-11 rounded-lg" onClick={onPrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print receipt
            </Button>
          </div>
        </div>

        <div className="border-t border-border/70 bg-muted/20 p-8 lg:border-l lg:border-t-0">
          <h2 className="text-base font-semibold">Request progress</h2>
          <ol className="mt-6 space-y-7">
            <TimelineItem active label="Submitted" detail="Request received" />
            <TimelineItem label="Maintenance review" detail="Pending" />
            <TimelineItem label="Assigned to technician" detail="Pending" />
            <TimelineItem label="Completed" detail="Pending" />
          </ol>
        </div>
      </section>
    </div>
  );
}

function HelpPanel() {
  return (
    <aside className="h-fit rounded-2xl border border-border/70 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Info className="h-4 w-4" />
        </span>
        <h2 className="text-sm font-semibold">What happens next</h2>
      </div>
      <ul className="mt-5 space-y-5 text-sm">
        <li>
          <p className="font-medium">You will receive a reference number</p>
          <p className="mt-1 text-muted-foreground">
            Keep it for follow-up at reception.
          </p>
        </li>
        <li>
          <p className="font-medium">Maintenance will review the request</p>
          <p className="mt-1 text-muted-foreground">
            The team checks priority, photos, and the affected room.
          </p>
        </li>
        <li>
          <p className="font-medium">Status updates stay at reception</p>
          <p className="mt-1 text-muted-foreground">
            Staff can check progress using your reference number.
          </p>
        </li>
      </ul>
    </aside>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function TimelineItem({
  active,
  label,
  detail,
}: {
  active?: boolean;
  label: string;
  detail: string;
}) {
  return (
    <li className="flex gap-4">
      <span
        className={cn(
          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
          active
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-white text-muted-foreground"
        )}
      >
        {active ? <Check className="h-4 w-4" /> : null}
      </span>
      <div>
        <p className="font-medium">{label}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{detail}</p>
      </div>
    </li>
  );
}
