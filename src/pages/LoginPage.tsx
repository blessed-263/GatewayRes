import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, LayoutDashboard, Monitor, Wrench } from "lucide-react";
import { GatewayLogo } from "@/components/brand/GatewayLogo";
import { Button } from "@/components/ui/button";
import { demoUserForRole } from "@/data/demoUsers";
import { useAuth } from "@/context/AuthContext";
import { isStaffLoginPath } from "@/lib/authRoutes";
import { images } from "@/lib/images";
import { homePathForRole } from "@/lib/repairAccess";
import { loginPortals, portalFromPath } from "@/lib/loginPortals";
import type { AuthSession } from "@/types/auth";

const roleIcons = {
  supervisor: LayoutDashboard,
  worker: Wrench,
} as const;

export function LoginPage() {
  const { portal: portalParam } = useParams<{ portal: string }>();
  const portalKey = portalFromPath(portalParam);
  if (!portalKey) {
    return <Navigate to="/" replace />;
  }

  const portal = loginPortals[portalKey];
  const demoUser = demoUserForRole(portal.role);
  const RoleIcon = roleIcons[portal.role];

  const { loginAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const otherPortals = Object.values(loginPortals).filter((p) => p.role !== portal.role);

  function handleLogin() {
    const session: AuthSession = {
      userId: demoUser.id,
      username: demoUser.username,
      name: demoUser.name,
      role: demoUser.role,
      assigneeName: demoUser.assigneeName,
    };

    loginAs(session);

    const dest =
      from && !isStaffLoginPath(from) ? from : homePathForRole(session.role);
    navigate(dest, { replace: true });
  }

  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img
          src={images.building}
          alt="Gateway Student Accommodation residence"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to interfaces
          </Link>

          <GatewayLogo variant="light" height={40} className="my-6" />

          <div className="glass-card max-w-md p-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/70">
              {portal.subtitle}
            </p>
            <h1 className="mt-2 text-3xl font-medium leading-tight">{portal.title}</h1>
            <p className="mt-3 max-w-sm text-sm text-white/75">{portal.description}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="relative h-44 shrink-0 lg:hidden">
          <img
            src={images.building}
            alt=""
            className="h-full w-full object-cover"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-black/20" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-white">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-white/85 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
            <GatewayLogo height={32} />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center px-6 py-8 sm:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-sm space-y-8">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {portal.subtitle}
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
              <p className="text-sm text-muted-foreground">
                Use the demo account below to enter this workspace.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <RoleIcon className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="text-lg font-semibold">{demoUser.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{demoUser.subtitle}</p>
                </div>
              </div>
            </div>

            <Button type="button" onClick={handleLogin} className="h-12 w-full rounded-xl text-base">
              Sign in
            </Button>

            <div className="grid gap-2">
              <Button asChild variant="outline" className="w-full rounded-xl">
                <Link to="/kiosk">
                  <Monitor className="mr-2 h-4 w-4" />
                  Open student kiosk
                </Link>
              </Button>
              {otherPortals.map((item) => (
                <Button
                  key={item.path}
                  asChild
                  variant="ghost"
                  className="w-full rounded-xl text-muted-foreground"
                >
                  <Link to={item.path}>{item.title} instead</Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
