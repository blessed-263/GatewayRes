import { Link } from "react-router-dom";
import {
  ArrowRight,
  ClipboardList,
  LayoutDashboard,
  Monitor,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    accent: "from-primary/20 to-primary/5",
  },
  {
    key: "supervisor",
    title: loginPortals.supervisor.title,
    description: loginPortals.supervisor.description,
    to: loginPortals.supervisor.path,
    cta: "Supervisor sign in",
    icon: LayoutDashboard,
    accent: "from-sky-500/15 to-sky-500/5",
  },
  {
    key: "maintenance",
    title: loginPortals.maintenance.title,
    description: loginPortals.maintenance.description,
    to: loginPortals.maintenance.path,
    cta: "Maintenance sign in",
    icon: Wrench,
    accent: "from-amber-500/15 to-amber-500/5",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-[#f6f6f3] text-slate-950">
      <header className="border-b border-border/70 bg-primary text-primary-foreground">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-semibold tracking-tight">Gateway</span>
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
              Student Residences
            </p>
          </div>
          <p className="hidden text-sm text-white/80 sm:block">NSFAS Accredited · Johannesburg</p>
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

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          {interfaces.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                to={item.to}
                className="group overflow-hidden rounded-[1.5rem] border border-border/70 bg-white shadow-sm shadow-black/[0.03] transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`bg-gradient-to-br ${item.accent} p-6`}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
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
        © {new Date().getFullYear()} Gateway Student Accommodation · 30 Claim Street, Doornfontein
      </footer>
    </div>
  );
}
