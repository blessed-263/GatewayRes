import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOperations } from "@/context/OperationsContext";
import { useRepairs } from "@/context/RepairsContext";
import { formatZar } from "@/lib/budgetConfig";
import { Briefcase, FileText, Users } from "lucide-react";

export function ContractorsPage() {
  const { contractors, assignContractor, updateInvoiceStatus } = useOperations();
  const { repairs } = useRepairs();

  const activeContractors = contractors.filter((c) => c.active).length;
  const pendingInvoices = contractors.reduce(
    (sum, c) => sum + c.invoices.filter((i) => i.status === "pending").length,
    0
  );

  return (
    <>
      <PageHeader
        title="Contractors & Vendors"
        description="External specialists with scoped job access, quotes, and invoice tracking."
        actions={
          <Link to="/login/contractor" className="text-sm font-semibold text-primary hover:underline">
            Open contractor portal →
          </Link>
        }
      />
      <main className="flex-1 space-y-6 p-5 pb-10 sm:p-8 lg:p-10">
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Active vendors"
            value={activeContractors}
            subtitle="Registered contractors"
            icon={Users}
            color="primary"
          />
          <StatCard
            title="Pending invoices"
            value={pendingInvoices}
            subtitle="Awaiting payment approval"
            icon={FileText}
            color={pendingInvoices > 0 ? "warning" : "success"}
          />
          <StatCard
            title="Assigned jobs"
            value={repairs.filter((r) => r.contractorId).length}
            subtitle="Linked to vendor accounts"
            icon={Briefcase}
            color="secondary"
          />
        </section>

        <div className="grid gap-5 xl:grid-cols-2">
          {contractors.map((contractor) => {
            const jobs = repairs.filter((r) => r.contractorId === contractor.id);
            return (
              <section
                key={contractor.id}
                className="rounded-[1.5rem] border border-border/70 bg-card p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">{contractor.name}</h2>
                    <p className="text-sm text-muted-foreground">{contractor.trade}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {contractor.buildings.join(" · ")}
                    </p>
                  </div>
                  <Badge variant={contractor.active ? "secondary" : "outline"}>
                    {contractor.active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Assigned jobs ({jobs.length})
                  </p>
                  {jobs.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">No linked jobs.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {jobs.slice(0, 4).map((job) => (
                        <li key={job.id} className="flex items-center justify-between text-sm">
                          <Link to={`/tasks/${job.id}`} className="font-medium text-primary hover:underline">
                            {job.title}
                          </Link>
                          <span className="text-muted-foreground">{job.status}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Invoices
                  </p>
                  {contractor.invoices.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">No invoices yet.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {contractor.invoices.map((inv) => (
                        <li
                          key={inv.id}
                          className="flex flex-col gap-2 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium">{inv.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {inv.repairId} · {format(parseISO(inv.submittedAt), "dd MMM yyyy")} ·{" "}
                              {formatZar(inv.amount)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{inv.status}</Badge>
                            {inv.status === "pending" ? (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="rounded-lg"
                                onClick={() =>
                                  updateInvoiceStatus(contractor.id, inv.id, "paid")
                                }
                              >
                                Mark paid
                              </Button>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {jobs[0] ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 rounded-xl"
                    onClick={() => assignContractor(jobs[0].id, contractor.id)}
                  >
                    Re-link to latest job
                  </Button>
                ) : null}
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
}
