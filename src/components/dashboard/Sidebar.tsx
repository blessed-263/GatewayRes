import { useNavigate } from "react-router-dom";
import { AppSidebarContent } from "@/components/layout/AppSidebarContent";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  collapsed,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/");
    onMobileClose?.();
  }

  return (
    <>
      <Sheet open={mobileOpen} onOpenChange={(open) => !open && onMobileClose?.()}>
        <SheetContent side="left" className="w-[min(100vw-2rem,20rem)] p-0">
          <AppSidebarContent onNavigate={onMobileClose} onLogout={handleLogout} />
        </SheetContent>
      </Sheet>

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border/70 bg-white transition-all duration-200 lg:flex",
          collapsed ? "w-[72px]" : "w-60"
        )}
      >
        <AppSidebarContent
          collapsed={collapsed}
          onLogout={handleLogout}
        />
      </aside>
    </>
  );
}
