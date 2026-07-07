import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { GuestOnlyRoute, ProtectedRoute, RoleRoute } from "@/components/auth/RouteGuards";
import { LandingRoute } from "@/components/auth/LandingRoute";
import { AuthProvider } from "@/context/AuthContext";
import { RepairsProvider } from "@/context/RepairsContext";
import { AppLayout } from "@/layouts/AppLayout";
import { homePathForRole } from "@/lib/repairAccess";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { BudgetPage } from "@/pages/BudgetPage";
import { CalendarPage } from "@/pages/CalendarPage";
import { DailyTasksPage } from "@/pages/DailyTasksPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { KioskPage } from "@/pages/KioskPage";
import { InventoryPage } from "@/pages/InventoryPage";
import { LoginPage } from "@/pages/LoginPage";
import { MyJobsPage } from "@/pages/MyJobsPage";
import { RepairDetailPage } from "@/pages/RepairDetailPage";
import { TasksPage } from "@/pages/TasksPage";
import { TeamMemberPage } from "@/pages/TeamMemberPage";
import { TeamPage } from "@/pages/TeamPage";
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RepairsProvider>
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

                <Route element={<RoleRoute roles={["supervisor"]} />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/daily" element={<DailyTasksPage />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/budget" element={<BudgetPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/team" element={<TeamPage />} />
                  <Route path="/team/:memberSlug" element={<TeamMemberPage />} />
                </Route>

                <Route element={<RoleRoute roles={["worker"]} />}>
                  <Route path="/my-jobs" element={<MyJobsPage />} />
                  <Route path="/my-jobs/:id" element={<WorkerJobPage />} />
                </Route>

                <Route element={<RoleRoute roles={["supervisor", "worker"]} />}>
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/tasks/:id" element={<TaskDetailEntry />} />
                </Route>

                <Route path="*" element={<HomeRedirect />} />
              </Route>
            </Route>
          </Routes>
        </RepairsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
