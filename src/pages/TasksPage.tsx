import { OpenTasksListView } from "@/components/dashboard/OpenTasksListView";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Link } from "react-router-dom";

export function TasksPage() {
  return (
    <>
      <PageHeader
        title="All Tasks"
        description="Complete task list with status and building filters."
        actions={
          <Link to="/daily" className="text-sm font-semibold text-primary hover:underline">
            View open tasks →
          </Link>
        }
      />
      <main className="flex-1 p-5 sm:p-8 lg:p-10">
        <OpenTasksListView initialStatusFilter="all" />
      </main>
    </>
  );
}
