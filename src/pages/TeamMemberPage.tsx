import { format, parseISO } from "date-fns";
import { Link, Navigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { TaskThumbnailCard } from "@/components/dashboard/TaskThumbnailCard";
import { useRepairs } from "@/context/RepairsContext";
import { getTeamProfileBySlug } from "@/data/teamProfiles";

export function TeamMemberPage() {
  const { memberSlug } = useParams<{ memberSlug: string }>();
  const { repairs } = useRepairs();

  const member = memberSlug ? getTeamProfileBySlug(memberSlug) : undefined;
  if (!member) return <Navigate to="/team" replace />;

  const allocatedTasks = repairs.filter(
    (repair) =>
      repair.assignedTo === member.name &&
      !["completed", "cancelled"].includes(repair.status)
  );

  const historyTasks = repairs
    .filter((repair) => repair.assignedTo === member.name)
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.reportedAt).getTime() -
        new Date(a.updatedAt ?? a.reportedAt).getTime()
    );

  const completedCount = historyTasks.filter((repair) => repair.status === "completed").length;
  const consumedInventoryUnits = historyTasks.reduce(
    (sum, repair) =>
      sum +
      (repair.partRequests ?? [])
        .filter((request) => request.pickedForDay)
        .reduce((requestSum, request) => requestSum + (request.allocatedQuantity ?? request.quantity), 0),
    0
  );
  const consumedInventoryAmount = historyTasks.reduce(
    (sum, repair) =>
      sum +
      (repair.partRequests ?? [])
        .filter((request) => request.pickedForDay)
        .reduce(
          (requestSum, request) =>
            requestSum +
            (request.estimatedCost ?? 0) * (request.allocatedQuantity ?? request.quantity),
          0
        ),
    0
  );

  return (
    <>
      <PageHeader
        title={member.name}
        description={`${member.role} · ${member.workType}`}
        actions={
          <Link to="/team" className="text-sm font-semibold text-primary hover:underline">
            ← Back to team
          </Link>
        }
      />
      <main className="flex-1 space-y-6 p-5 sm:p-8 lg:p-10">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{member.name}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Joined {format(parseISO(member.joinedAt), "dd MMM yyyy")} · {member.buildings.join(" · ")}
              </p>
            </div>
            <img
              src={member.avatarUrl}
              alt={member.name}
              className="h-16 w-16 rounded-full border border-border/70 object-cover"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {member.skills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <Stat label="Allocated tasks" value={String(allocatedTasks.length)} />
              <Stat label="Completed tasks" value={String(completedCount)} />
              <Stat label="Inventory consumed" value={`${consumedInventoryUnits} units`} />
              <Stat label="Inventory amount" value={`R ${Math.round(consumedInventoryAmount)}`} />
            </div>
          </CardContent>
        </Card>

        <section className="rounded-[1.5rem] border border-border/70 bg-card p-5">
          <h2 className="text-xl font-semibold">Allocated tasks</h2>
          {allocatedTasks.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No currently allocated tasks.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {allocatedTasks.map((repair) => (
                <TaskThumbnailCard key={repair.id} repair={repair} to={`/tasks/${repair.id}`} />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[1.5rem] border border-border/70 bg-card p-5">
          <h2 className="text-xl font-semibold">Task history</h2>
          {historyTasks.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No task history yet.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {historyTasks.slice(0, 12).map((repair) => (
                <TaskThumbnailCard
                  key={repair.id}
                  repair={repair}
                  to={`/tasks/${repair.id}`}
                  footer={`${repair.status} · ${format(parseISO(repair.reportedAt), "dd MMM yyyy")}`}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
