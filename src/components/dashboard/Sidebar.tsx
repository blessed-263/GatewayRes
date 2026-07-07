import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebarContent } from "@/components/layout/AppSidebarContent";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const THEME_KEY = "gateway-theme";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [dark, setDark] = useState(
    () => {
      if (typeof document === "undefined") return false;
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "dark") return true;
      if (saved === "light") return false;
      return document.documentElement.classList.contains("dark");
    }
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark]);

  function handleLogout() {
    logout();
    navigate("/");
    onMobileClose?.();
  }

  return (
    <>
      <Sheet open={mobileOpen} onOpenChange={(open) => !open && onMobileClose?.()}>
        <SheetContent side="left" className="w-[min(100vw-2rem,20rem)] p-0">
          <AppSidebarContent
            onNavigate={onMobileClose}
            dark={dark}
            onToggleDark={() => setDark((d) => !d)}
            onLogout={handleLogout}
          />
        </SheetContent>
      </Sheet>

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 lg:flex",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <AppSidebarContent
          collapsed={collapsed}
          onToggleCollapse={onToggle}
          dark={dark}
          onToggleDark={() => setDark((d) => !d)}
          onLogout={handleLogout}
        />
      </aside>
    </>
  );
}
