import { PageHeader } from "@/components/dashboard/PageHeader";
import { DragDropPlanningBoard } from "@/components/operations/DragDropPlanningBoard";

export function PlanningPage() {
  return (
    <>
      <PageHeader
        title="Planning Board"
        description="Drag tasks onto team members to assign and schedule the daily run."
      />
      <main className="flex-1 p-5 pb-10 sm:p-8 lg:p-10">
        <DragDropPlanningBoard />
      </main>
    </>
  );
}
