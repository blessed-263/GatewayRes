import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { MobileTopBar } from "@/components/layout/MobileTopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { cn } from "@/lib/utils";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
    setCollapsed(true);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300",
          "pb-16 lg:pb-0",
          collapsed ? "lg:pl-[72px]" : "lg:pl-64"
        )}
      >
        <MobileTopBar onMenuOpen={() => setMobileMenuOpen(true)} />
        <Outlet />
        <footer className="mt-auto hidden border-t border-border/70 bg-card/60 px-8 py-6 text-center text-xs text-muted-foreground lg:block">
          © {new Date().getFullYear()} Gateway Student Accommodation
        </footer>
      </div>

      <MobileBottomNav onMenuOpen={() => setMobileMenuOpen(true)} />
    </div>
  );
}
