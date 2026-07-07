import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Camera, ClipboardList, Package, Wrench } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { useRepairs } from "@/context/RepairsContext";
import { computeMaintenanceAnalytics } from "@/lib/analytics";
import { formatZar } from "@/lib/budgetConfig";
import {
  partRequestBadgeVariant,
  partRequestStatusLabels,
} from "@/lib/partRequestLabels";
import { formatDate } from "@/lib/utils";

const kindLabels: Record<string, string> = {
  report: "Report photos",
  before: "Before repair",
  after: "After repair",
  invoice: "Invoices",
};

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export function AnalyticsPage() {
  const { repairs } = useRepairs();
  const stats = computeMaintenanceAnalytics(repairs);

  const uploadsByKind = Object.entries(stats.attachmentsByKind).map(([key, value]) => ({
    name: kindLabels[key] ?? key,
    value,
  }));

  const partsByStatus = Object.entries(stats.partRequestsByStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: partRequestStatusLabels[status as keyof typeof partRequestStatusLabels],
      status,
      count,
    }));

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Uploads, part requests, and maintenance activity across all properties"
      />
      <main className="flex-1 space-y-8 p-5 pb-10 sm:p-8 lg:p-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Photo uploads"
            value={stats.totalAttachments}
            subtitle="Images & documents on repairs"
            icon={Camera}
            color="primary"
          />
          <StatCard
            title="Part requests"
            value={stats.totalPartRequests}
            subtitle={`${stats.pendingPartRequests} pending approval`}
            icon={Package}
            color="warning"
            delay={0.08}
          />
          <StatCard
            title="Awaiting parts"
            value={stats.repairsAwaitingParts}
            subtitle="Jobs blocked on stock"
            icon={Wrench}
            color="warning"
            delay={0.16}
          />
          <StatCard
            title="Total repairs"
            value={stats.totalRepairs}
            subtitle="All logged maintenance tasks"
            icon={ClipboardList}
            color="success"
            delay={0.24}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="elevated-card p-6">
            <h3 className="font-heading text-2xl font-semibold">Uploads by month</h3>
            <p className="mb-5 mt-1 text-base text-muted-foreground">
              Photos and files attached to repairs
            </p>
            {stats.uploadsByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.uploadsByMonth} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
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
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No uploads yet. Add photos when logging or completing repairs.
              </p>
            )}
          </div>

          <div className="elevated-card p-6">
            <h3 className="font-heading text-2xl font-semibold">Upload types</h3>
            <p className="mb-5 mt-1 text-base text-muted-foreground">
              Breakdown by attachment category
            </p>
            {uploadsByKind.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={uploadsByKind}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={2}
                  >
                    {uploadsByKind.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">No upload data yet.</p>
            )}
            {uploadsByKind.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {uploadsByKind.map((item, i) => (
                  <li key={item.name} className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    {item.name} ({item.value})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="elevated-card p-6">
            <h3 className="font-heading text-2xl font-semibold">Part requests by status</h3>
            <p className="mb-5 mt-1 text-base text-muted-foreground">Fulfilment pipeline</p>
            {partsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={partsByStatus}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={72}
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
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No part requests yet. Technicians can request parts from a job screen.
              </p>
            )}
          </div>

          <div className="elevated-card p-6">
            <h3 className="font-heading text-2xl font-semibold">Most requested parts</h3>
            <p className="mb-5 mt-1 text-base text-muted-foreground">By total quantity ordered</p>
            {stats.topRequestedParts.length > 0 ? (
              <ul className="space-y-3">
                {stats.topRequestedParts.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3 text-base"
                  >
                    <span className="truncate font-medium">{item.name}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {item.count} units
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">No parts logged yet.</p>
            )}
          </div>
        </div>

        <div className="elevated-card p-6">
          <h3 className="font-heading text-2xl font-semibold">Recent part requests</h3>
          <p className="mb-5 mt-1 text-base text-muted-foreground">Latest requests across all repairs</p>
          {stats.recentPartRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Part</th>
                    <th className="pb-2 pr-4 font-medium">Repair</th>
                    <th className="pb-2 pr-4 font-medium">Requested</th>
                    <th className="pb-2 pr-4 font-medium">Est. cost</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPartRequests.map((part) => (
                    <tr key={part.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 pr-4">
                        <span className="font-medium">{part.quantity}× {part.partName}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <Link
                          to={`/tasks/${part.repairId}`}
                          className="text-primary hover:underline"
                        >
                          {part.repairTitle}
                        </Link>
                        <p className="text-xs text-muted-foreground">{part.unit}</p>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {part.requestedBy}
                        <br />
                        <span className="text-xs">{formatDate(part.requestedAt)}</span>
                      </td>
                      <td className="py-3 pr-4 tabular-nums">
                        {part.estimatedCost != null ? formatZar(part.estimatedCost) : "-"}
                      </td>
                      <td className="py-3">
                        <Badge variant={partRequestBadgeVariant(part.status)}>
                          {partRequestStatusLabels[part.status]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Part requests will appear here once technicians submit them.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
