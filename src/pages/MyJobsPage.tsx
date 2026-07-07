import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Clock, PackageCheck, Wrench } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/ui/empty-state";
import { GlassStatCard } from "@/components/dashboard/GlassStatCard";
import { TaskThumbnailCard } from "@/components/dashboard/TaskThumbnailCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRepairs } from "@/context/RepairsContext";
import { images } from "@/lib/images";
import { partRequestStatusLabels } from "@/lib/partRequestLabels";
import { repairsForUser } from "@/lib/repairAccess";
import type { Repair } from "@/types/repair";

type Filter = "today" | "active" | "done" | "all";

export function MyJobsPage() {
  const { user } = useAuth();
  const { repairs, updateRepair, markPartPickedForDay } = useRepairs();
  const [busyId, setBusyId] = useState<string | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");
  const myJobs = useMemo(
    () => (user ? repairsForUser(repairs, user) : []),
    [repairs, user]
  );

  const counts = useMemo(
    () => ({
      today: myJobs.filter(
        (r) =>
          r.scheduledFor === today &&
          r.status !== "completed" &&
          r.status !== "cancelled"
      ).length,
      active: myJobs.filter(
        (r) => r.status === "in_progress" || r.status === "awaiting_parts"
      ).length,
      done: myJobs.filter((r) => r.status === "completed").length,
      all: myJobs.filter((r) => r.status !== "cancelled").length,
    }),
    [myJobs, today]
  );

  function filterJobs(filter: Filter) {
    switch (filter) {
      case "today":
        return myJobs.filter(
          (r) =>
            r.scheduledFor === today &&
            r.status !== "completed" &&
            r.status !== "cancelled"
        );
      case "active":
        return myJobs.filter(
          (r) => r.status === "in_progress" || r.status === "awaiting_parts"
        );
      case "done":
        return myJobs.filter((r) => r.status === "completed");
      default:
        return myJobs.filter((r) => r.status !== "cancelled");
    }
  }

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const todayJobs = myJobs.filter(
    (job) =>
      job.scheduledFor === today &&
      job.status !== "completed" &&
      job.status !== "cancelled"
  );
  const toolPrepJobs = todayJobs.filter(
    (job) =>
      job.needsTools ||
      (job.partRequests ?? []).some((request) =>
        ["pending", "ordered", "received"].includes(request.status)
      )
  );

  return (
    <div className="flex flex-1 flex-col space-y-6 p-5 pb-10 sm:p-8 lg:p-10">
      <section className="overflow-hidden rounded-[1.75rem] border border-primary/15 bg-white shadow-sm shadow-black/[0.03]">
        <div className="bg-primary px-6 py-7 text-primary-foreground sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
            My assigned jobs
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Hi, {firstName}
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-white/80">
            Least-privilege view: only the work assigned to you appears here.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 p-5 sm:gap-4 sm:p-6">
          <GlassStatCard
            tone="frosted"
            icon={Clock}
            label="Today"
            value={String(counts.today)}
            className="min-h-32 p-4"
          />
          <GlassStatCard
            tone="frosted"
            icon={Wrench}
            label="Active"
            value={String(counts.active)}
            className="min-h-32 p-4"
          />
          <GlassStatCard
            tone="frosted"
            icon={CheckCircle2}
            label="Done"
            value={String(counts.done)}
            className="min-h-32 p-4"
          />
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-border/70 bg-card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Start-of-day toolkit
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Tools and parts needed today
            </h2>
          </div>
          <Badge variant="secondary" className="text-sm">
            {toolPrepJobs.length} job{toolPrepJobs.length === 1 ? "" : "s"}
          </Badge>
        </div>
        {toolPrepJobs.length === 0 ? (
          <p className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
            No tool-prep actions yet. Mark any of today&apos;s jobs as requiring tools.
          </p>
        ) : (
          <div className="space-y-3">
            {toolPrepJobs.map((job) => (
              <article key={job.id} className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold">{job.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.unit} · {job.building}
                    </p>
                  </div>
                  <Link to={`/my-jobs/${job.id}`} className="text-sm font-medium text-primary hover:underline">
                    Open job →
                  </Link>
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(job.needsTools)}
                    onChange={async (event) => {
                      setBusyId(job.id);
                      try {
                        await updateRepair(job.id, {
                          needsTools: event.target.checked,
                          actor: user?.name ?? "Worker",
                        });
                      } finally {
                        setBusyId(null);
                      }
                    }}
                    disabled={busyId === job.id}
                  />
                  Mark this job as needing tools
                </label>
                {(job.partRequests ?? []).filter((request) => request.status !== "cancelled").length > 0 && (
                  <div className="mt-3 space-y-2">
                    {(job.partRequests ?? [])
                      .filter((request) => request.status !== "cancelled")
                      .map((request) => (
                        <div
                          key={request.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-card px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {request.quantity}× {request.partName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {partRequestStatusLabels[request.status]}
                              {request.allocatedQuantity ? ` · Allocated ${request.allocatedQuantity}` : ""}
                            </p>
                          </div>
                          {request.status === "received" && (
                            <Button
                              type="button"
                              size="sm"
                              variant={request.pickedForDay ? "secondary" : "outline"}
                              className="h-9"
                              onClick={async () => {
                                setBusyId(request.id);
                                try {
                                  await markPartPickedForDay(
                                    job.id,
                                    request.id,
                                    !request.pickedForDay,
                                    user?.name ?? "Worker"
                                  );
                                } finally {
                                  setBusyId(null);
                                }
                              }}
                              disabled={busyId === request.id}
                            >
                              <PackageCheck className="h-4 w-4" />
                              {request.pickedForDay ? "Picked" : "Mark picked"}
                            </Button>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <Tabs defaultValue="today" className="flex flex-1 flex-col">
        <TabsList className="grid h-auto w-full grid-cols-4 rounded-2xl bg-muted/60 p-1.5">
          <TabsTrigger value="today" className="min-h-11 rounded-xl text-sm">
            Today ({counts.today})
          </TabsTrigger>
          <TabsTrigger value="active" className="min-h-11 rounded-xl text-sm">
            Active ({counts.active})
          </TabsTrigger>
          <TabsTrigger value="done" className="min-h-11 rounded-xl text-sm">
            Done ({counts.done})
          </TabsTrigger>
          <TabsTrigger value="all" className="min-h-11 rounded-xl text-sm">
            All ({counts.all})
          </TabsTrigger>
        </TabsList>

        {(["today", "active", "done", "all"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-5 space-y-3">
            <JobList jobs={filterJobs(tab)} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function JobList({ jobs }: { jobs: Repair[] }) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        image={images.maintenance}
        imageAlt="No jobs"
        title="Nothing here"
        description="Check another tab or wait for new assignments."
      />
    );
  }

  return (
    <div className="space-y-3.5">
      {jobs.map((job) => (
        <TaskThumbnailCard
          key={job.id}
          repair={job}
          to={`/my-jobs/${job.id}`}
          footer={
            job.scheduledFor
              ? `Scheduled ${format(new Date(job.scheduledFor), "dd MMM")}`
              : "Not scheduled"
          }
        />
      ))}
    </div>
  );
}
