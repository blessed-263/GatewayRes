import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  ListTodo,
} from "lucide-react";
import { RequestsByDayPanel } from "@/components/dashboard/RequestsByDayPanel";
import { StatCard } from "@/components/dashboard/StatCard";
import { WorkerRankingPanel } from "@/components/dashboard/WorkerRankingPanel";
import { useRepairs } from "@/context/RepairsContext";
import {
  countByComplaintType,
  countKpis,
  rankWorkersByClosed,
  rankWorkersByOpen,
} from "@/lib/dashboardMetrics";
import { statusLabels } from "@/lib/repairLabels";
import type { RepairStatus } from "@/types/repair";

const statusOrder: RepairStatus[] = [
  "open",
  "in_progress",
  "awaiting_parts",
  "completed",
  "cancelled",
];

export function AnalyticsPage() {
  const { repairs } = useRepairs();

  const kpis = useMemo(() => countKpis(repairs), [repairs]);
  const problemTypes = useMemo(() => countByComplaintType(repairs), [repairs]);
  const closedRanking = useMemo(() => rankWorkersByClosed(repairs), [repairs]);
  const openRanking = useMemo(() => rankWorkersByOpen(repairs), [repairs]);

  const statusBreakdown = useMemo(() => {
    return statusOrder
      .map((status) => ({
        status,
        name: statusLabels[status],
        count: repairs.filter((r) => r.status === status).length,
      }))
      .filter((row) => row.count > 0);
  }, [repairs]);

  return (
    <main className="flex-1 space-y-8 p-5 pb-10 sm:p-8 lg:p-10">
      <section className="rounded-[1.75rem] border border-primary/15 bg-primary px-6 py-7 text-primary-foreground sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Analytics</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/85">
          Operational insights from maintenance jobs — no budget or inventory data.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total jobs"
            value={kpis.total}
            subtitle="All non-cancelled jobs"
            icon={ListTodo}
            color="primary"
          />
          <StatCard
            title="Needs attention"
            value={kpis.needsAttention}
            subtitle="Open, in progress, awaiting parts"
            icon={AlertCircle}
            color="warning"
            delay={0.08}
          />
          <StatCard
            title="Completed"
            value={kpis.completed}
            subtitle="Closed jobs"
            icon={CheckCircle2}
            color="success"
            delay={0.16}
          />
          <StatCard
            title="Overdue"
            value={kpis.overdue}
            subtitle="Past schedule or SLA"
            icon={ClipboardList}
            color="danger"
            delay={0.24}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-card p-6">
            <h3 className="text-lg font-semibold">Maintenance jobs by type</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Job counts by maintenance type
            </p>
            <ResponsiveContainer width="100%" height={280} className="mt-5">
              <BarChart
                data={problemTypes}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid horizontal={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={120}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 flex flex-wrap gap-2">
              {problemTypes.map((item) => (
                <Link
                  key={item.category}
                  to={`/tasks?type=${item.category}`}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {item.label} ({item.count})
                </Link>
              ))}
            </div>
          </div>

          {statusBreakdown.length > 0 && (
            <div className="rounded-2xl border border-border/70 bg-card p-6">
              <h3 className="text-lg font-semibold">Maintenance jobs by status</h3>
              <p className="mt-1 text-sm text-muted-foreground">Current pipeline breakdown</p>
              <ResponsiveContainer width="100%" height={280} className="mt-5">
                <BarChart data={statusBreakdown} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <RequestsByDayPanel repairs={repairs} listMaxHeight="max-h-[40rem]" />

        <div className="grid gap-6 xl:grid-cols-2">
          <WorkerRankingPanel variant="completed" items={closedRanking} />
          <WorkerRankingPanel variant="backlog" items={openRanking} />
        </div>
    </main>
  );
}
