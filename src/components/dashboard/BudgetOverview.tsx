import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryColors, formatZar } from "@/lib/budgetConfig";
import { categoryLabels } from "@/lib/repairLabels";
import type { Repair, RepairCategory } from "@/types/repair";

interface BudgetOverviewProps {
  repairs: Repair[];
}

export function BudgetOverview({ repairs }: BudgetOverviewProps) {
  const data = Object.entries(
    repairs.reduce<
      Record<string, { spent: number; count: number }>
    >((acc, repair) => {
      const raw = repair.category || "other";
      const legacyMap: Record<string, RepairCategory> = {
        furniture: "appliance",
        security: "other",
        general: "other",
      };
      const cat = (legacyMap[raw] ?? raw) as RepairCategory;
      if (!acc[cat]) acc[cat] = { spent: 0, count: 0 };
      acc[cat].spent += repair.actual_cost ?? repair.estimated_cost ?? 0;
      acc[cat].count += 1;
      return acc;
    }, {})
  )
    .map(([key, val]) => ({
      name:
        categoryLabels[key as RepairCategory] ??
        key.replace(/_/g, " "),
      spent: val.spent,
      count: val.count,
      key,
    }))
    .sort((a, b) => b.spent - a.spent);

  return (
    <Card className="overflow-hidden border-border/60">
      <CardHeader className="border-b border-border/70">
        <CardTitle className="font-heading text-2xl">
          Spending by Category
        </CardTitle>
        <p className="text-base text-muted-foreground">
          Compare estimated and actual maintenance spend across repair types.
        </p>
      </CardHeader>
      <CardContent className="p-5 sm:p-7">
        {data.length > 0 && data.some((d) => d.spent > 0) ? (
          <ResponsiveContainer width="100%" height={Math.max(280, data.length * 52)}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 32, left: 0, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
                formatter={(value, _name, item) => {
                  const count = (item?.payload as { count?: number })?.count;
                  return [
                    formatZar(Number(value)),
                    `Spent${count != null ? ` · ${count} repair${count === 1 ? "" : "s"}` : ""}`,
                  ];
                }}
              />
              <Bar dataKey="spent" radius={[0, 10, 10, 0]} maxBarSize={26}>
                {data.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={categoryColors[entry.key as RepairCategory]?.bar ?? "#7a9daf"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-14 text-center text-base text-muted-foreground">
            No spending data yet. Add estimated or actual costs to repairs.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
