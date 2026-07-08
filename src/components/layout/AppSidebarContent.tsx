import { Link, useLocation } from "react-router-dom";
import { GatewayLogo } from "@/components/brand/GatewayLogo";
import {
  BarChart3,
  Calendar,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { navForRole, type NavItem } from "@/lib/navConfig";
import { cn } from "@/lib/utils";

const navIcons: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/tasks": ClipboardList,
  "/calendar": Calendar,
  "/analytics": BarChart3,
  "/team": Users,
  "/my-jobs": Wrench,
};

function isNavActive(path: string, pathname: string) {
  if (path === "/my-jobs") {
    return pathname === path || pathname.startsWith(`${path}/`);
  }
  if (path === "/dashboard") return pathname === path;
  if (path === "/tasks") return pathname === "/tasks" || pathname.startsWith("/tasks/");
  return pathname.startsWith(path);
}

interface AppSidebarContentProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
  onLogout?: () => void;
}

export function AppSidebarContent({
  collapsed = false,
  onNavigate,
  onLogout,
}: AppSidebarContentProps) {
  const location = useLocation();
  const { user } = useAuth();
  const navItems = navForRole(user?.role);
  const isSupervisor = user?.role === "supervisor";

  return (
    <div
      className={cn(
        "flex h-full flex-col",
        isSupervisor ? "bg-white text-slate-800" : "bg-sidebar text-sidebar-foreground"
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center gap-2 px-5",
          collapsed && "lg:justify-center lg:px-0"
        )}
      >
        <GatewayLogo
          height={collapsed ? 28 : 32}
          className={cn(collapsed && "lg:max-w-[2.5rem]")}
        />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            item={item}
            active={isNavActive(item.path, location.pathname)}
            collapsed={collapsed}
            onNavigate={onNavigate}
            supervisorStyle={isSupervisor}
          />
        ))}
      </nav>

      {onLogout && (
        <div className={cn("border-t border-border/60 p-3", collapsed && "lg:px-2")}>
          <button
            type="button"
            onClick={onLogout}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              collapsed && "lg:justify-center"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className={cn(collapsed && "lg:hidden")}>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}

function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
  supervisorStyle,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
  supervisorStyle?: boolean;
}) {
  const Icon = navIcons[item.path] ?? LayoutDashboard;

  if (supervisorStyle) {
    return (
      <Link
        to={item.path}
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          collapsed && "lg:justify-center lg:px-2",
          active
            ? "bg-primary text-white shadow-sm"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
        <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
      </Link>
    );
  }

  return (
    <Link
      to={item.path}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        collapsed && "lg:justify-center lg:px-2",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
    </Link>
  );
}
