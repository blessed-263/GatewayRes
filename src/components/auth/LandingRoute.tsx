import { Navigate } from "react-router-dom";
import { LandingPage } from "@/pages/LandingPage";
import { useAuth } from "@/context/AuthContext";
import { homePathForRole } from "@/lib/repairAccess";

export function LandingRoute() {
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

  return <LandingPage />;
}
