import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  ClipboardList,
  Home,
  LayoutDashboard,
  Menu,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { mobileTabsForRole } from "@/lib/navConfig";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const tabIcons: Record<string, LucideIcon> = {
  "/": LayoutDashboard,
  "/my-jobs": Wrench,
  "/daily": Home,
  "/tasks": ClipboardList,
  "/calendar": Calendar,
};

interface MobileBottomNavProps {
  onMenuOpen: () => void;
}

export function MobileBottomNav({ onMenuOpen }: MobileBottomNavProps) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const tabs = mobileTabsForRole(user?.role);

  if (tabs.length === 0) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden"
      aria-label="Main navigation"
    >
      <div
        className="grid h-16"
        style={{
          gridTemplateColumns: `repeat(${tabs.length + 1}, minmax(0, 1fr))`,
        }}
      >
        {tabs.map((item) => {
          const isActive =
            item.path === "/my-jobs"
              ? pathname === item.path || pathname.startsWith(`${item.path}/`)
              : item.path === "/"
                ? pathname === "/"
                : pathname.startsWith(item.path);
          const Icon = tabIcons[item.path] ?? LayoutDashboard;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              <span className="max-w-full truncate px-1">{item.shortLabel}</span>
            </Link>
          );
        })}
        <Button
          type="button"
          variant="ghost"
          className="flex h-full flex-col items-center justify-center gap-0.5 rounded-none text-[10px] font-medium text-muted-foreground"
          onClick={onMenuOpen}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
          <span>More</span>
        </Button>
      </div>
    </nav>
  );
}
