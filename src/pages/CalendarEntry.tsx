import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { homePathForRole } from "@/lib/repairAccess";
import { SupervisorCalendarPage } from "@/pages/SupervisorCalendarPage";
import { WorkerCalendarPage } from "@/pages/WorkerCalendarPage";

export function CalendarEntry() {
  const { user } = useAuth();

  if (user?.role === "worker") {
    return <WorkerCalendarPage />;
  }

  if (user?.role === "supervisor") {
    return <SupervisorCalendarPage />;
  }

  return <Navigate to={homePathForRole("supervisor")} replace />;
}
