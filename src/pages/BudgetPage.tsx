import { ClipboardCheck, TrendingUp, Wallet } from "lucide-react";
import { BudgetOverview } from "@/components/dashboard/BudgetOverview";
import { ExportButtons } from "@/components/dashboard/ExportButtons";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { useRepairs } from "@/context/RepairsContext";
import { formatZar } from "@/lib/budgetConfig";

export function BudgetPage() {
  const { repairs } = useRepairs();

  const totalSpent = repairs.reduce(
    (sum, r) => sum + (r.actual_cost ?? r.estimated_cost ?? 0),
    0
  );
  const totalEstimated = repairs.reduce(
    (sum, r) => sum + (r.estimated_cost ?? 0),
    0
  );
  const withCosts = repairs.filter(
    (r) => (r.actual_cost ?? r.estimated_cost ?? 0) > 0
  ).length;

  return (
    <>
      <PageHeader
        title="Budget"
        description="Maintenance spend by category across all properties"
        actions={<ExportButtons repairs={repairs} />}
      />
      <main className="flex-1 space-y-8 p-5 sm:p-8 lg:p-10">
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Spend"
            value={formatZar(totalSpent)}
            subtitle="Actual or estimated"
            icon={Wallet}
            color="primary"
          />
          <StatCard
            title="Estimated Pipeline"
            value={formatZar(totalEstimated)}
            subtitle="Quoted work not yet closed"
            icon={TrendingUp}
            color="warning"
            delay={0.08}
          />
          <StatCard
            title="Tracked Repairs"
            value={withCosts}
            subtitle={`of ${repairs.length} with cost data`}
            icon={ClipboardCheck}
            color="success"
            delay={0.16}
          />
        </section>
        <BudgetOverview repairs={repairs} />
      </main>
    </>
  );
}
