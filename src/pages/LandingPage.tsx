import { Link } from "react-router-dom";
import {
  ArrowRight,
  LayoutDashboard,
  Monitor,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GatewayLogo } from "@/components/brand/GatewayLogo";
import { brand } from "@/lib/brand";
import { loginPortals } from "@/lib/loginPortals";

const interfaces: {
  key: string;
  title: string;
  description: string;
  to: string;
  cta: string;
  icon: LucideIcon;
  accent: string;
}[] = [
  {
    key: "kiosk",
    title: "Student kiosk",
    description:
      "Front-desk terminal for students to log maintenance issues and receive a reference number.",
    to: "/kiosk",
    cta: "Open kiosk",
    icon: Monitor,
    accent: "from-primary/35 via-[#7BDCB5]/25 to-white",
  },
  {
    key: "supervisor",
    title: loginPortals.supervisor.title,
    description: loginPortals.supervisor.description,
    to: loginPortals.supervisor.path,
    cta: "Supervisor sign in",
    icon: LayoutDashboard,
    accent: "from-sky-400/30 via-sky-50/90 to-white",
  },
  {
    key: "maintenance",
    title: loginPortals.maintenance.title,
    description: loginPortals.maintenance.description,
    to: loginPortals.maintenance.path,
    cta: "Maintenance sign in",
    icon: Wrench,
    accent: "from-amber-400/30 via-amber-50/90 to-white",
  },
];

export function LandingPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#f6f6f3] text-slate-950">
      <header className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6 lg:px-8">
        <a href={brand.siteUrl} target="_blank" rel="noreferrer">
          <GatewayLogo height={44} />
        </a>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 lg:px-8 lg:py-10">
        <section className="relative mb-8 overflow-hidden rounded-[1.75rem] sm:mb-10">
          <img
            src="/images/IMG_4811.JPG.jpeg"
            alt="Gateway Student Accommodation"
            className="h-48 w-full object-cover sm:h-64 lg:h-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </section>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {interfaces.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                to={item.to}
                className="group overflow-hidden rounded-[1.5rem] border border-border/70 bg-white shadow-sm shadow-black/[0.03] transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className={`bg-gradient-to-br ${item.accent} p-6`}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-md">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h2 className="mt-5 text-2xl font-semibold tracking-tight">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
                <div className="flex items-center justify-between border-t border-border/70 px-6 py-4 text-sm font-semibold text-primary">
                  <span>{item.cta}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </section>
      </main>

      <footer className="mt-auto border-t border-border/70 bg-white/90 py-5 text-center text-xs text-muted-foreground backdrop-blur-sm">
        © {new Date().getFullYear()} Gateway Student Accommodation
      </footer>
    </div>
  );
}


