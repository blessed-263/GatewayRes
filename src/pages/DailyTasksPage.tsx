import { OpenTasksListView } from "@/components/dashboard/OpenTasksListView";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Link } from "react-router-dom";

export function DailyTasksPage() {
  return (
    <>
      <PageHeader
        title="Open Tasks"
        description="Focus list for active triage and assignment."
        actions={
          <Link to="/tasks" className="text-sm font-semibold text-primary hover:underline">
            View all tasks →
          </Link>
        }
      />
      <main className="flex-1 p-5 sm:p-8 lg:p-10">
        <OpenTasksListView initialStatusFilter="open" />
      </main>
    </>
  );
}
