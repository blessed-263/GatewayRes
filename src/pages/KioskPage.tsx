import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Home, Info, Wrench } from "lucide-react";
import { GatewayLogo } from "@/components/brand/GatewayLogo";
import { KioskBackdrop } from "@/components/brand/BlurredPhotoHero";
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
import { images } from "@/lib/images";
import { cn } from "@/lib/utils";
import type {
  Building,
  Repair,
  RepairCategory,
} from "@/types/repair";

const kioskFieldClass = "h-11 bg-white text-slate-900";
const kioskTextareaClass = "min-h-[120px] bg-white text-slate-900";

export function KioskPage() {
  const { addRepair } = useRepairs();
  const [started, setStarted] = useState(false);
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
    <div className="kiosk-page relative min-h-[100dvh] bg-[#f6f6f3] text-slate-900">
      <KioskBackdrop image={images.residence} />

      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        <KioskHeader />

        <main className="kiosk-print-shell mx-auto flex w-full max-w-7xl flex-1 px-6 py-8 lg:px-8">
        {!started ? (
          <WelcomeScreen onStart={() => setStarted(true)} />
        ) : submittedRepair ? (
          <SuccessScreen repair={submittedRepair} />
        ) : (
          <div className="w-full space-y-6">
            <section className="kiosk-surface p-5 sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Maintenance jobs
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                Gateway Student Accomodation maintenance form
              </h1>
              <p className="mt-2 max-w-5xl text-justify text-sm leading-6 text-slate-600">
                Complete the student details and maintenance job details on this page, then submit
                once everything is correct.
              </p>
            </section>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section className="kiosk-surface overflow-hidden">
                <div className="space-y-8 p-6 sm:p-7">
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

                  <div className="border-t border-slate-200 pt-8">
                    <ProblemDetailsStep
                      category={category}
                      setCategory={setCategory}
                      description={description}
                      setDescription={setDescription}
                    />
                  </div>

                  {error && (
                    <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {error}
                    </p>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-lg"
                    onClick={resetKiosk}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    className="h-11 rounded-lg px-8"
                    disabled={!canSubmit || submitting}
                    onClick={() => void submitRequest()}
                  >
                    {submitting ? "Submitting..." : "Submit maintenance job"}
                  </Button>
                </div>

                <p className="border-t border-slate-200 px-6 py-4 text-center text-sm text-slate-600 sm:px-7">
                  WI-FI and TV related issues, please contact 081 491 5304 via WhatsApp.
                </p>
              </section>

              <HelpPanel />
            </div>
          </div>
        )}
        </main>
      </div>
    </div>
  );
}

function KioskHeader() {
  return (
    <header className="kiosk-no-print relative overflow-hidden border-b border-border/40">
      <img
        src={images.hero}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full scale-105 object-cover blur-xl brightness-50"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#3A4B96]/95 via-primary/90 to-[#1A1927]/90" />
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div>
          <GatewayLogo variant="light" height={40} />
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
            Student Accommodation
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
      <section className="kiosk-surface w-full max-w-3xl p-8 text-center sm:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary bg-primary/10 text-primary shadow-sm">
          <Wrench className="h-9 w-9" strokeWidth={1.8} />
        </div>
        <h1 className="mt-7 text-4xl font-semibold tracking-tight text-slate-900">
            Maintenance jobs
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-600">
          WI-FI and TV related issues, please contact 081 491 5304 via WhatsApp. A ref number
          will be displayed after you submit.
        </p>
        <Button type="button" size="lg" className="mt-8 h-14 rounded-lg px-12 text-lg" onClick={onStart}>
          Start a new request
        </Button>
        <p className="mt-6 text-sm text-slate-600">
          For urgent safety issues, notify reception immediately.
        </p>
      </section>
    </div>
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
        <h2 className="text-xl font-semibold text-slate-900">Student details</h2>
        <p className="text-sm text-slate-600">
          Fields marked with * are required.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Field label="Name *" htmlFor="firstName">
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter name"
            className={kioskFieldClass}
            autoFocus
          />
        </Field>
        <Field label="Surname *" htmlFor="surname">
          <Input
            id="surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="Enter surname"
            className={kioskFieldClass}
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
        <Field label="Floor *">
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
        <Field label="Room number (eg L002, G213 OR 0916) *" htmlFor="unit">
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
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Maintenance job details</h2>
        <p className="text-sm text-slate-600">
          Tell us what issue you need help with.
        </p>
      </div>
      <Field label="Type of maintenance job *">
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
      <Field label="How can we help you? *" htmlFor="description">
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

function SuccessScreen({ repair }: { repair: Repair }) {
  return (
    <div className="grid min-h-[calc(100dvh-8rem)] w-full place-items-center">
      <section className="kiosk-print-receipt kiosk-surface w-full max-w-2xl">
        <div className="p-8 text-center sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary bg-primary/10 text-primary">
            <Check className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-primary">
            Request submitted
          </h1>
          <p className="mt-2 text-slate-600">
            Your maintenance request has been received.
          </p>

          <div className="mx-auto mt-7 max-w-md border-y border-slate-200 py-5">
            <p className="text-sm text-slate-500">Ref number</p>
            <p className="mt-1 font-mono text-3xl font-semibold text-primary">
              {repair.id}
            </p>
          </div>

          <dl className="mx-auto mt-5 grid max-w-sm grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-left text-sm">
            <dt className="text-slate-500">Student:</dt>
            <dd className="font-medium text-slate-900">{repair.reportedBy}</dd>
            <dt className="text-slate-500">Unit:</dt>
            <dd className="font-medium text-slate-900">{repair.unit}</dd>
            <dt className="text-slate-500">Category:</dt>
            <dd className="font-medium text-slate-900">{categoryLabels[repair.category]}</dd>
            <dt className="text-slate-500">Status:</dt>
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
    { title: "Status updates stay at reception", body: "Staff can check progress using your reference number.", color: "bg-emerald-500" },
  ];

  return (
    <aside className="kiosk-surface h-fit border-primary/20 p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
          <Info className="h-4 w-4" />
        </span>
        <h2 className="text-sm font-semibold text-slate-900">What happens next</h2>
      </div>
      <ul className="mt-5 space-y-5 text-sm">
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
              <p className="mt-1 text-slate-600">{step.body}</p>
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
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-slate-800">
        {label}
      </Label>
      {children}
    </div>
  );
}

