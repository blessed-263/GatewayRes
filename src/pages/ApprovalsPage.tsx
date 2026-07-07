import { Link } from "react-router-dom";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { HIGH_COST_APPROVAL_THRESHOLD } from "@/data/slaConfig";
import { useAuth } from "@/context/AuthContext";
import { useOperations } from "@/context/OperationsContext";
import { formatZar } from "@/lib/budgetConfig";
import { ShieldCheck, FileText, AlertTriangle } from "lucide-react";

export function ApprovalsPage() {
  const { user } = useAuth();
  const { pendingApprovals, pendingQuotes, setApprovalStatus, updateQuoteStatus } =
    useOperations();

  const actor = user?.name ?? "Supervisor";

  return (
    <>
      <PageHeader
        title="Approvals & Quotes"
        description={`High-cost repairs above ${formatZar(HIGH_COST_APPROVAL_THRESHOLD)} require supervisor sign-off before work proceeds.`}
      />
      <main className="flex-1 space-y-6 p-5 pb-10 sm:p-8 lg:p-10">
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Pending approvals"
            value={pendingApprovals.length}
            subtitle="Awaiting supervisor decision"
            icon={ShieldCheck}
            color={pendingApprovals.length > 0 ? "warning" : "success"}
          />
          <StatCard
            title="Quotes in review"
            value={pendingQuotes.length}
            subtitle="Submitted contractor quotes"
            icon={FileText}
            color="primary"
          />
          <StatCard
            title="Threshold"
            value={formatZar(HIGH_COST_APPROVAL_THRESHOLD)}
            subtitle="Auto-triggers approval chain"
            icon={AlertTriangle}
            color="secondary"
          />
        </section>

        <section className="rounded-[1.5rem] border border-border/70 bg-card p-5 sm:p-6">
          <h2 className="text-xl font-semibold">Approval queue</h2>
          {pendingApprovals.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No pending approvals.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {pendingApprovals.map((repair) => (
                <li
                  key={repair.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/60 p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <Link to={`/tasks/${repair.id}`} className="font-semibold text-primary hover:underline">
                      {repair.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {repair.id} · {repair.unit} · {repair.building}
                    </p>
                    <p className="mt-1 text-sm">
                      {repair.approvalRequiredBecause ?? "Requires approval"}
                      {repair.estimated_cost ? ` · Est. ${formatZar(repair.estimated_cost)}` : ""}
                    </p>
                    {repair.quote ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Quote: {repair.quote.scope} — {formatZar(repair.quote.amount)}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="rounded-xl"
                      onClick={() => setApprovalStatus(repair.id, "approved", actor)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => setApprovalStatus(repair.id, "rejected", actor)}
                    >
                      Reject
                    </Button>
                    {repair.quote ? (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="rounded-xl"
                          onClick={() => updateQuoteStatus(repair.id, "approved", actor)}
                        >
                          Approve quote
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-xl"
                          onClick={() => updateQuoteStatus(repair.id, "rejected", actor, "Scope too broad")}
                        >
                          Reject quote
                        </Button>
                      </>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[1.5rem] border border-border/70 bg-card p-5 sm:p-6">
          <h2 className="text-xl font-semibold">Quote → approve → execute</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Major works flow: contractor submits quote → supervisor approves → job moves to in progress → invoice on completion.
          </p>
          <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>1. Draft quote attached to repair</li>
            <li>2. Supervisor approves or rejects</li>
            <li>3. Approved jobs proceed to execution</li>
            <li>4. Contractor submits invoice from vendor portal</li>
          </ol>
        </section>
      </main>
    </>
  );
}
