import { Link } from "react-router-dom";
import { AlertTriangle, ClipboardList, Wallet } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { TaskThumbnailCard } from "@/components/dashboard/TaskThumbnailCard";
import { useAuth } from "@/context/AuthContext";
import { useRepairs } from "@/context/RepairsContext";
import { formatZar } from "@/lib/budgetConfig";

interface GatewayDashboardProps {
  isLoading?: boolean;
}

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function GatewayDashboard({ isLoading = false }: GatewayDashboardProps) {
  const { user } = useAuth();
  const { repairs: tasks, inventoryItems } = useRepairs();

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const greeting = greetingForHour(new Date().getHours());

  const openTasks = tasks.filter((task) => task.status === "open");
  const criticalTaskCount = tasks.filter(
    (task) =>
      !["completed", "cancelled"].includes(task.status) &&
      (task.priority === "urgent" || task.priority === "high" || task.status === "awaiting_parts")
  ).length;
  const lowStockCount = inventoryItems.filter(
    (item) => item.onHand <= item.reorderLevel
  ).length;
  const spendTotal = tasks.reduce(
    (sum, task) => sum + (task.actual_cost ?? task.estimated_cost ?? 0),
    0
  );

  return (
    <div className="space-y-6 p-5 pb-10 sm:p-8 lg:p-10">
      <section className="rounded-[1.75rem] border border-primary/15 bg-primary px-6 py-7 text-primary-foreground sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
          Supervisor dashboard
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {greeting}, {firstName}
        </h1>
        <p className="mt-3 max-w-3xl text-base text-white/85 sm:text-lg">
          Critical items first: stock alerts, critical jobs, and maintenance spend.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Inventory alerts"
          value={lowStockCount}
          subtitle="Items at or below reorder level"
          icon={AlertTriangle}
          color={lowStockCount > 0 ? "warning" : "success"}
        />
        <StatCard
          title="Critical tasks"
          value={criticalTaskCount}
          subtitle="Urgent/high priority or awaiting parts"
          icon={ClipboardList}
          color="danger"
        />
        <StatCard
          title="Amount spent"
          value={formatZar(spendTotal)}
          subtitle="Actual + estimated maintenance spend"
          icon={Wallet}
          color="primary"
        />
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Link
          to="/daily"
          className="rounded-2xl border border-border/70 bg-card px-6 py-5 text-center text-lg font-semibold hover:bg-muted/30"
        >
          Daily Tasks
        </Link>
        <Link
          to="/tasks"
          className="rounded-2xl border border-border/70 bg-card px-6 py-5 text-center text-lg font-semibold hover:bg-muted/30"
        >
          All Tasks
        </Link>
        <Link
          to="/inventory"
          className="rounded-2xl border border-border/70 bg-card px-6 py-5 text-center text-lg font-semibold hover:bg-muted/30"
        >
          Inventory Manager
        </Link>
      </section>

      <section className="rounded-[1.5rem] border border-border/70 bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            Open tasks ({openTasks.length})
          </h2>
          <Link to="/tasks" className="text-sm font-semibold text-primary hover:underline">
            View full list →
          </Link>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground">Loading open tasks…</p>
        ) : openTasks.length === 0 ? (
          <p className="rounded-xl border border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
            No open tasks right now.
          </p>
        ) : (
          <div className="space-y-3">
            {openTasks.slice(0, 6).map((task) => (
              <TaskThumbnailCard key={task.id} repair={task} to={`/tasks/${task.id}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
