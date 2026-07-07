import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  Moon,
  Package,
  Sun,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { navForRole, type NavItem } from "@/lib/navConfig";
import { cn } from "@/lib/utils";

const navIcons: Record<string, LucideIcon> = {
  "/": LayoutDashboard,
  "/my-jobs": Wrench,
  "/daily": Home,
  "/tasks": ClipboardList,
  "/calendar": Calendar,
  "/analytics": BarChart3,
  "/budget": Wallet,
  "/inventory": Package,
  "/team": Users,
};

const roleLabel: Record<string, string> = {
  supervisor: "Supervisor",
  worker: "Technician",
};

const navGroups = [
  { key: "overview", label: "Overview", paths: ["/", "/my-jobs"] },
  { key: "operations", label: "Operations", paths: ["/tasks", "/daily"] },
  { key: "planning", label: "Planning", paths: ["/calendar", "/inventory"] },
  { key: "insights", label: "Insights", paths: ["/analytics", "/budget"] },
  { key: "people", label: "People", paths: ["/team"] },
] as const;

function isNavActive(path: string, pathname: string) {
  if (path === "/my-jobs") {
    return pathname === path || pathname.startsWith(`${path}/`);
  }
  if (path === "/") return pathname === "/";
  return pathname.startsWith(path);
}

interface AppSidebarContentProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
  dark?: boolean;
  onToggleDark?: () => void;
  onLogout?: () => void;
}

export function AppSidebarContent({
  collapsed = false,
  onNavigate,
  onToggleCollapse,
  dark = false,
  onToggleDark,
  onLogout,
}: AppSidebarContentProps) {
  const location = useLocation();
  const { user } = useAuth();
  const navItems = navForRole(user?.role);

  const initials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const groupedNavItems = navGroups
    .map((group) => ({
      ...group,
      items: navItems.filter((item) => group.paths.some((path) => path === item.path)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div
        className={cn(
          "flex h-16 items-center gap-2.5 px-4",
          collapsed && "lg:justify-center lg:px-0"
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
        </span>
        <div className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
          <h1 className="truncate font-heading text-[15px] font-semibold leading-tight tracking-tight">
            Gateway
          </h1>
          <p className="truncate text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">
            Staff Portal
          </p>
        </div>
      </div>

      <Separator />

      {user && (
        <div className={cn("px-3 pt-3", collapsed && "lg:px-2")}>
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl border border-transparent bg-muted/60 px-2.5 py-2",
              collapsed && "lg:justify-center lg:px-0"
            )}
          >
            <Avatar className="h-9 w-9 shrink-0 border-2 border-background">
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
              <p className="truncate text-sm font-medium leading-tight">{user.name}</p>
              <Badge
                variant="secondary"
                className="mt-0.5 h-[18px] px-1.5 text-[10px] font-medium leading-none"
              >
                {roleLabel[user.role] ?? user.role}
              </Badge>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {groupedNavItems.map((group) => (
          <div
            key={group.key}
            className={cn(
              "space-y-1 rounded-xl border border-transparent px-2 py-1",
              !collapsed && "bg-muted/[0.18]"
            )}
          >
            <p
              className={cn(
                "px-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground",
                collapsed && "lg:hidden"
              )}
            >
              {group.label}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                item={item}
                active={isNavActive(item.path, location.pathname)}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className={cn("border-t border-sidebar-border p-3", collapsed && "lg:px-2")}>
        <p
          className={cn(
            "mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground",
            collapsed && "lg:hidden"
          )}
        >
          Account
        </p>
        <div className={cn("flex gap-2", collapsed && "lg:flex-col")}>
          {onToggleCollapse && (
            <UtilityButton
              icon={collapsed ? ChevronsRight : ChevronsLeft}
              label={collapsed ? "Expand" : "Collapse"}
              onClick={onToggleCollapse}
              collapsed={collapsed}
              hideLabelDesktop
            />
          )}
          {onToggleDark && (
            <UtilityButton
              icon={dark ? Sun : Moon}
              label={dark ? "Light mode" : "Dark mode"}
              onClick={onToggleDark}
              collapsed={collapsed}
            />
          )}
        </div>
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className={cn(
              "mt-2 flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive",
              collapsed && "lg:justify-center"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className={cn(collapsed && "lg:hidden")}>Sign out</span>
          </button>
        )}
      </div>
    </div>
  );
}

function UtilityButton({
  icon: Icon,
  label,
  onClick,
  collapsed,
  hideLabelDesktop,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  collapsed: boolean;
  hideLabelDesktop?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/60 px-3 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        collapsed && "lg:w-full"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span
        className={cn(
          collapsed && "lg:hidden",
          hideLabelDesktop && "hidden sm:inline lg:hidden"
        )}
      >
        {label}
      </span>
    </button>
  );
}

function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = navIcons[item.path] ?? LayoutDashboard;

  return (
    <Link
      to={item.path}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        collapsed && "lg:justify-center lg:px-2",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
          active
            ? "bg-white/15 text-primary-foreground"
            : "bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
    </Link>
  );
}
