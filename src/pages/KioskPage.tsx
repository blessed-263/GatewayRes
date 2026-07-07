import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Home, Info, Wrench } from "lucide-react";
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
import { useRepairs } from "@/context/RepairsContext";
import {
  buildingOptions,
  floorsForBuilding,
  type ComplaintBuilding,
} from "@/data/buildingFloors";
import { complaintTypeOptions } from "@/lib/complaintTypes";
import { categoryLabels } from "@/lib/repairLabels";
import { cn } from "@/lib/utils";
import type {
  Building,
  Repair,
  RepairCategory,
} from "@/types/repair";

type KioskStep = 0 | 1 | 2;

export function KioskPage() {
  const { addRepair } = useRepairs();
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState<KioskStep>(0);
  const [submittedRepair, setSubmittedRepair] = useState<Repair | null>(null);

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [building, setBuilding] = useState<ComplaintBuilding>(buildingOptions[0]);
  const [floor, setFloor] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState<RepairCategory>(complaintTypeOptions[0].value);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roomStepComplete =
    firstName.trim() && surname.trim() && building.trim() && floor.trim() && unit.trim();
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
    setFirstName("");
    setSurname("");
    setBuilding(buildingOptions[0]);
    setFloor("");
    setUnit("");
    setCategory(complaintTypeOptions[0].value);
    setDescription("");
    setSubmitting(false);
    setError(null);
  }

  async function submitRequest() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const repair = await addRepair({
          unit: unit.trim(),
          building: building as Building,
          floor: floor.trim(),
          title: issueTitle,
          description: description.trim(),
          category,
          reportedBy: `${firstName.trim()} ${surname.trim()}`.trim(),
          loggedBy: "Gateway Kiosk",
        });
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
          <SuccessScreen repair={submittedRepair} />
        ) : (
          <div className="w-full space-y-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-primary">
                Maintenance complaints
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                Gateway Student Accomodation maintenance form
              </h1>
            </div>

            <StepIndicator step={step} />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section className="rounded-2xl border border-border/70 bg-white shadow-sm">
                <div className="p-6 sm:p-7">
                  {step === 0 && (
                    <RoomDetailsStep
                      firstName={firstName}
                      setFirstName={setFirstName}
                      surname={surname}
                      setSurname={setSurname}
                      building={building}
                      setBuilding={setBuilding}
                      floor={floor}
                      setFloor={setFloor}
                      unit={unit}
                      setUnit={setUnit}
                    />
                  )}

                  {step === 1 && (
                    <ProblemDetailsStep
                      category={category}
                      setCategory={setCategory}
                      description={description}
                      setDescription={setDescription}
                    />
                  )}

                  {step === 2 && (
                    <ReviewStep
                      firstName={firstName}
                      surname={surname}
                      building={building}
                      floor={floor}
                      unit={unit}
                      category={category}
                      description={description}
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

                <p className="border-t border-border/70 px-6 py-4 text-center text-sm text-muted-foreground sm:px-7">
                  WI-FI and TV related issues, please contact 081 491 5304 via WhatsApp.
                </p>
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
            Student Accomodation
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
          Maintenance complaints
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
          WI-FI and TV related issues, please contact 081 491 5304 via WhatsApp. A ref number
          will be displayed after you submit.
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
  const steps = ["Student details", "Complaint details", "Review"];
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
  firstName,
  setFirstName,
  surname,
  setSurname,
  building,
  setBuilding,
  floor,
  setFloor,
  unit,
  setUnit,
}: {
  firstName: string;
  setFirstName: (value: string) => void;
  surname: string;
  setSurname: (value: string) => void;
  building: ComplaintBuilding;
  setBuilding: (value: ComplaintBuilding) => void;
  floor: string;
  setFloor: (value: string) => void;
  unit: string;
  setUnit: (value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Student details</h2>
        <p className="text-sm text-muted-foreground">
          Fields marked with * are required.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name *" htmlFor="firstName">
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter name"
            className="h-11"
            autoFocus
          />
        </Field>
        <Field label="Surname *" htmlFor="surname">
          <Input
            id="surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="Enter surname"
            className="h-11"
          />
        </Field>
        <Field label="Building *">
          <Select
            value={building}
            onValueChange={(value) => {
              setBuilding(value as ComplaintBuilding);
              setFloor("");
              setUnit("");
            }}
          >
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {buildingOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Floor *">
          <Select value={floor || undefined} onValueChange={setFloor}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select floor" />
            </SelectTrigger>
            <SelectContent>
              {floorsForBuilding(building).map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Room number (eg L002, G213 OR 0916) *" htmlFor="unit">
          <Input
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value.toUpperCase())}
            placeholder="e.g. L002"
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
  description,
  setDescription,
}: {
  category: RepairCategory;
  setCategory: (value: RepairCategory) => void;
  description: string;
  setDescription: (value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Complaint details</h2>
        <p className="text-sm text-muted-foreground">
          Tell us what issue you need help with.
        </p>
      </div>
      <Field label="Type of complaint *">
        <Select value={category} onValueChange={(value) => setCategory(value as RepairCategory)}>
          <SelectTrigger className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {complaintTypeOptions.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="How can we help you? *" htmlFor="description">
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your complaint clearly."
          className="min-h-[120px]"
        />
      </Field>
    </div>
  );
}

function ReviewStep({
  firstName,
  surname,
  building,
  floor,
  unit,
  category,
  description,
}: {
  firstName: string;
  surname: string;
  building: Building;
  floor: string;
  unit: string;
  category: RepairCategory;
  description: string;
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
        <ReviewItem label="Name" value={firstName} />
        <ReviewItem label="Surname" value={surname} />
        <ReviewItem label="Building" value={building} />
        <ReviewItem label="Floor" value={floor} />
        <ReviewItem label="Room number" value={unit} />
        <ReviewItem label="Type of complaint" value={categoryLabels[category]} />
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

function SuccessScreen({ repair }: { repair: Repair }) {
  return (
    <div className="grid min-h-[calc(100dvh-8rem)] w-full place-items-center">
      <section className="kiosk-print-receipt w-full max-w-2xl overflow-hidden rounded-2xl border border-border/70 bg-white shadow-lg shadow-black/5">
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
            <p className="text-sm text-muted-foreground">Ref number</p>
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
            The team reviews the complaint and assigns priority.
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
