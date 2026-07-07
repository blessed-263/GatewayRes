import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { loginPathForProtectedPath } from "@/lib/authRoutes";
import { homePathForRole } from "@/lib/repairAccess";
import type { UserRole } from "@/types/auth";

export function ProtectedRoute() {
  const { user, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user) {
    const loginPath = loginPathForProtectedPath(location.pathname);
    return (
      <Navigate
        to={loginPath}
        replace
        state={loginPath === "/" ? undefined : { from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}

export function RoleRoute({ roles }: { roles: UserRole[] }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return <Navigate to={homePathForRole(user?.role ?? "supervisor")} replace />;
  }
  return <Outlet />;
}

export function GuestOnlyRoute() {
  const { user, isReady } = useAuth();
  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (user) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }
  return <Outlet />;
}
