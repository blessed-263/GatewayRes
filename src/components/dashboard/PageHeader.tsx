import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="border-b border-border/70 bg-background px-5 py-5 sm:px-8 lg:px-10 lg:py-8">
      <div className="overflow-hidden rounded-[1.5rem] border border-primary/15 bg-card shadow-sm shadow-black/[0.03]">
        <div className="flex flex-col gap-5 border-b border-border/70 px-5 py-5 sm:px-7 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-7">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h1>
          {description ? (
              <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
                {description}
              </p>
          ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
