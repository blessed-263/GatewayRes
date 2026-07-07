import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { GuestOnlyRoute, ProtectedRoute, RoleRoute } from "@/components/auth/RouteGuards";
import { LandingRoute } from "@/components/auth/LandingRoute";
import { AuthProvider } from "@/context/AuthContext";
import { OperationsProvider } from "@/context/OperationsContext";
import { RepairsProvider } from "@/context/RepairsContext";
import { AppLayout } from "@/layouts/AppLayout";
import { homePathForRole } from "@/lib/repairAccess";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { CalendarEntry } from "@/pages/CalendarEntry";
import { DashboardPage } from "@/pages/DashboardPage";
import { KioskPage } from "@/pages/KioskPage";
import { LoginPage } from "@/pages/LoginPage";
import { MyJobsPage } from "@/pages/MyJobsPage";
import { RepairDetailPage } from "@/pages/RepairDetailPage";
import { SupervisorTeamPage } from "@/pages/SupervisorTeamPage";
import { TeamMemberPage } from "@/pages/TeamMemberPage";
import { TasksPage } from "@/pages/TasksPage";
import { WorkerJobPage } from "@/pages/WorkerJobPage";
import { useAuth } from "@/context/AuthContext";
import { portalFromPath } from "@/lib/loginPortals";

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return <Navigate to={homePathForRole(user.role)} replace />;
}

function TaskDetailEntry() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();

  if (user?.role === "worker") {
    return <Navigate to={`/my-jobs/${id ?? ""}`} replace />;
  }

  return <RepairDetailPage />;
}

function LoginPortalRoute() {
  const { portal } = useParams<{ portal: string }>();
  if (!portalFromPath(portal)) {
    return <Navigate to="/" replace />;
  }
  return <LoginPage />;
}

function LegacySupervisorRedirect() {
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RepairsProvider>
          <OperationsProvider>
            <Routes>
              <Route path="/" element={<LandingRoute />} />
              <Route path="/kiosk" element={<KioskPage />} />

              <Route element={<GuestOnlyRoute />}>
                <Route path="/login/:portal" element={<LoginPortalRoute />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/home" element={<HomeRedirect />} />
                  <Route path="/calendar" element={<CalendarEntry />} />

                  <Route element={<RoleRoute roles={["supervisor"]} />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/daily" element={<Navigate to="/tasks" replace />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/team" element={<SupervisorTeamPage />} />
                    <Route path="/planning" element={<LegacySupervisorRedirect />} />
                    <Route path="/budget" element={<LegacySupervisorRedirect />} />
                    <Route path="/inventory" element={<LegacySupervisorRedirect />} />
                    <Route path="/properties" element={<LegacySupervisorRedirect />} />
                    <Route path="/preventive" element={<LegacySupervisorRedirect />} />
                    <Route path="/approvals" element={<LegacySupervisorRedirect />} />
                    <Route path="/templates" element={<LegacySupervisorRedirect />} />
                    <Route path="/contractors" element={<LegacySupervisorRedirect />} />
                    <Route path="/team/:memberSlug" element={<TeamMemberPage />} />
                  </Route>

                  <Route element={<RoleRoute roles={["worker"]} />}>
                    <Route path="/my-jobs" element={<MyJobsPage />} />
                    <Route path="/my-jobs/:id" element={<WorkerJobPage />} />
                  </Route>

                  <Route element={<RoleRoute roles={["supervisor", "worker"]} />}>
                    <Route path="/tasks/:id" element={<TaskDetailEntry />} />
                  </Route>

                  <Route path="*" element={<HomeRedirect />} />
                </Route>
              </Route>
            </Routes>
          </OperationsProvider>
        </RepairsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
