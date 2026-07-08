import { Link } from "react-router-dom";
import {
  ArrowRight,
  ClipboardList,
  LayoutDashboard,
  Monitor,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GatewayLogo } from "@/components/brand/GatewayLogo";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { images } from "@/lib/images";
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
    accent: "from-primary/35 via-emerald-50/80 to-white",
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
    <div className="min-h-[100dvh] bg-[#f6f6f3] text-slate-950">
      <header className="relative overflow-hidden border-b border-border/70">
        <img
          src={images.hero}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-xl brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#3A4B96]/95 via-primary/90 to-[#1A1927]/95" />
        <div className="relative mx-auto flex h-20 max-w-6xl items-center justify-between px-6 lg:px-8">
          <div>
            <a href={brand.siteUrl} target="_blank" rel="noreferrer">
              <GatewayLogo variant="light" height={44} />
            </a>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
              Student Accommodation in Johannesburg
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-14">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Gateway maintenance platform
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Choose your interface
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Students log issues at the kiosk. Supervisors manage operations. Maintenance
              staff work assigned jobs with least-privilege access.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-xl px-6">
                <Link to="/kiosk">
                  Start at kiosk
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 rounded-xl px-6">
                <Link to={loginPortals.supervisor.path}>Staff sign in</Link>
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-white shadow-sm shadow-black/[0.04]">
            <img
              src={images.building}
              alt="Gateway residences"
              className="h-56 w-full object-cover sm:h-72"
            />
            <div className="space-y-3 p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ClipboardList className="h-4 w-4 text-primary" />
                One platform, three clear workflows
              </div>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Student submits at the kiosk</li>
                <li>2. Supervisor triages and assigns work</li>
                <li>3. Maintenance completes the job</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      <footer className="border-t border-border/70 bg-white/80 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Gateway Student Accommodation
      </footer>
    </div>
  );
}
