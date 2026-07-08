import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Home, Info, MessageCircle, Wrench } from "lucide-react";
import { GatewayLogo } from "@/components/brand/GatewayLogo";
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

const kioskCardClass = "rounded-2xl border border-slate-200/90 bg-white shadow-sm";
const kioskFieldClass = "kiosk-field";
const kioskTextareaClass = "min-h-[140px] rounded-xl border-slate-200 bg-slate-50/80 text-base leading-7 shadow-none focus-visible:bg-white";

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
      <KioskHomeButton />

      <main className="kiosk-print-shell mx-auto flex w-full max-w-6xl flex-1 px-6 py-8 lg:px-8">
        {!started ? (
          <WelcomeScreen onStart={() => setStarted(true)} />
        ) : submittedRepair ? (
          <SuccessScreen repair={submittedRepair} />
        ) : (
          <div className="w-full space-y-6">
            <div className="space-y-1 text-center">
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Gateway Student Accomodation maintenance form
              </h1>
            </div>

            <StepIndicator step={step} />

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
              <section className={cn(kioskCardClass, "overflow-hidden")}>
                <KioskWifiBanner />

                <div className="px-6 py-7 sm:px-8 sm:py-8">
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
                    <p className="mt-5 rounded-xl bg-destructive/10 px-4 py-3 text-center text-base text-destructive">
                      {error}
                    </p>
                  )}
                </div>

                <div className="kiosk-form-actions">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11 rounded-lg px-4 text-slate-600 hover:text-slate-900"
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
                      className="h-11 min-w-[10rem] rounded-lg px-6"
                      disabled={step === 0 ? !roomStepComplete : !problemStepComplete}
                      onClick={() => setStep((current) => (current + 1) as KioskStep)}
                    >
                      {step === 0 ? "Continue" : "Review"}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="h-11 min-w-[10rem] rounded-lg px-6"
                      disabled={!canSubmit || submitting}
                      onClick={() => void submitRequest()}
                    >
                      {submitting ? "Submitting..." : "Submit"}
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
    <header className="kiosk-no-print mx-auto flex h-24 max-w-6xl items-center justify-center px-6 pt-4 lg:px-8">
      <GatewayLogo height={52} />
    </header>
  );
}

function KioskHomeButton() {
  return (
    <Link
      to="/"
      className={cn(
        "kiosk-no-print group fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full",
        "bg-primary text-primary-foreground shadow-lg shadow-primary/20",
        "ring-4 ring-white/80 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
      )}
      aria-label="Go home"
      title="Go home"
    >
      <Home className="h-6 w-6 transition-transform group-hover:scale-110" strokeWidth={2.2} />
    </Link>
  );
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="grid min-h-[calc(100dvh-8rem)] w-full place-items-center">
      <section className={cn(kioskCardClass, "w-full max-w-2xl p-8 text-center sm:p-10")}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-primary text-primary">
          <Wrench className="h-7 w-7" strokeWidth={1.8} />
        </div>
        <h1 className="mt-6 font-heading text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Maintenance jobs
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-600">
          WI-FI and TV related issues, please contact 081 491 5304 via WhatsApp. A reference
          number will be displayed after you submit.
        </p>
        <Button
          type="button"
          size="lg"
          className="mt-8 h-12 rounded-lg px-10 text-base font-semibold"
          onClick={onStart}
        >
          Start a new request
        </Button>
        <p className="mt-6 text-center text-sm leading-6 text-slate-500">
          For urgent safety issues, notify reception immediately.
        </p>
      </section>
    </div>
  );
}

function KioskWifiBanner() {
  return (
    <div className="flex items-start gap-3 border-b border-slate-200/80 bg-sky-50/70 px-6 py-4 text-sm text-slate-700 sm:px-8">
      <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p>
        Wi‑Fi and TV issues: WhatsApp{" "}
        <span className="font-semibold text-slate-900">081 491 5304</span>
      </p>
    </div>
  );
}

function StepIndicator({ step }: { step: KioskStep }) {
  const steps = ["Student details", "Job details", "Review"];
  return (
    <ol className="mx-auto flex max-w-3xl items-center justify-between gap-2">
      {steps.map((label, index) => (
        <li key={label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex w-full items-center">
            {index > 0 && (
              <span
                className={cn(
                  "h-0.5 flex-1",
                  index <= step ? "bg-primary" : "bg-slate-200"
                )}
              />
            )}
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                index === step
                  ? "bg-primary text-primary-foreground"
                  : index < step
                    ? "bg-primary/15 text-primary"
                    : "bg-slate-100 text-slate-400"
              )}
            >
              {index < step ? <Check className="h-4 w-4" /> : index + 1}
            </span>
            {index < steps.length - 1 && (
              <span
                className={cn(
                  "h-0.5 flex-1",
                  index < step ? "bg-primary" : "bg-slate-200"
                )}
              />
            )}
          </div>
          <span
            className={cn(
              "hidden text-center text-xs font-medium sm:block sm:text-sm",
              index === step ? "text-primary" : "text-slate-500"
            )}
          >
            {label}
          </span>
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
    <div className="space-y-6">
      <div className="border-b border-slate-200/80 pb-5">
        <h2 className="kiosk-step-title">Student details</h2>
        <p className="kiosk-step-lead mt-1">Required fields are marked with *</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" required htmlFor="firstName">
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter name"
            className={kioskFieldClass}
            autoFocus
          />
        </Field>
        <Field label="Surname" required htmlFor="surname">
          <Input
            id="surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="Enter surname"
            className={kioskFieldClass}
          />
        </Field>
        <Field label="Building" required>
          <Select
            value={building}
            onValueChange={(value) => {
              setBuilding(value as ComplaintBuilding);
              setFloor("");
              setUnit("");
            }}
          >
            <SelectTrigger className={kioskFieldClass}>
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
        <Field label="Floor" required>
          <Select value={floor || undefined} onValueChange={setFloor}>
            <SelectTrigger className={kioskFieldClass}>
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
        <Field
          label="Room number"
          required
          htmlFor="unit"
          hint="e.g. L002, G213, 0916"
          className="sm:col-span-2"
        >
          <Input
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value.toUpperCase())}
            placeholder="e.g. L002"
            className={kioskFieldClass}
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
    <div className="space-y-6">
      <div className="border-b border-slate-200/80 pb-5">
        <h2 className="kiosk-step-title">Maintenance job details</h2>
        <p className="kiosk-step-lead mt-1">Describe the issue you need help with.</p>
      </div>
      <Field label="Type of maintenance job" required>
        <Select value={category} onValueChange={(value) => setCategory(value as RepairCategory)}>
          <SelectTrigger className={kioskFieldClass}>
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
      <Field label="How can we help you?" required htmlFor="description">
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the maintenance job clearly."
          className={kioskTextareaClass}
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
    <div className="space-y-6">
      <div className="border-b border-slate-200/80 pb-5">
        <h2 className="kiosk-step-title">Review</h2>
        <p className="kiosk-step-lead mt-1">Confirm your details before submitting.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ReviewItem label="Name" value={firstName} />
        <ReviewItem label="Surname" value={surname} />
        <ReviewItem label="Building" value={building} />
        <ReviewItem label="Floor" value={floor} />
        <ReviewItem label="Room number" value={unit} />
        <ReviewItem label="Type of maintenance job" value={categoryLabels[category]} />
      </div>
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Description
        </p>
        <p className="mt-2 text-base leading-7 text-slate-800">{description}</p>
      </div>
    </div>
  );
}

function SuccessScreen({ repair }: { repair: Repair }) {
  return (
    <div className="grid min-h-[calc(100dvh-8rem)] w-full place-items-center">
      <section className={cn(kioskCardClass, "kiosk-print-receipt w-full max-w-2xl")}>
        <div className="p-10 text-center sm:p-14">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary bg-primary/10 text-primary">
            <Check className="h-11 w-11" />
          </div>
          <h1 className="mt-8 font-heading text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
            Request submitted
          </h1>
          <p className="kiosk-lead mt-4">
            Your maintenance request has been received.
          </p>

          <div className="mx-auto mt-8 max-w-md border-y border-border/70 py-6">
            <p className="text-base font-medium text-muted-foreground">Reference number</p>
            <p className="mt-2 font-mono text-4xl font-semibold text-primary sm:text-5xl">
              {repair.id}
            </p>
          </div>

          <dl className="mx-auto mt-6 grid max-w-md grid-cols-[auto_1fr] gap-x-10 gap-y-3 text-left text-base sm:text-lg">
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
  const steps = [
    { title: "You will receive a reference number", body: "Keep it for follow-up at reception.", color: "bg-sky-500" },
    { title: "Maintenance will review the request", body: "The team reviews the maintenance job and assigns priority.", color: "bg-primary" },
    { title: "Status updates stay at reception", body: "Staff can check progress using your reference number.", color: "bg-primary" },
  ];

  return (
    <aside className={cn(kioskCardClass, "hidden h-fit p-6 xl:block")}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Info className="h-4 w-4" />
        </span>
        <h2 className="font-heading text-base font-semibold">What happens next</h2>
      </div>
      <ul className="mt-5 space-y-4 text-sm">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                step.color
              )}
            >
              {index + 1}
            </span>
            <div>
              <p className="font-medium text-slate-900">{step.title}</p>
              <p className="mt-1 leading-6 text-slate-600">{step.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-primary"> *</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

