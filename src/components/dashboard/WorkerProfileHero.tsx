interface WorkerProfileHeroProps {
  workerName: string;
}

export function WorkerProfileHero({ workerName }: WorkerProfileHeroProps) {
  const firstName = workerName.split(" ")[0] ?? workerName;

  return (
    <section className="rounded-[1.75rem] border border-primary/15 bg-primary px-6 py-7 text-primary-foreground sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
        My jobs
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Hi, {firstName}</h1>
      <p className="mt-2 text-sm text-white/80">Tap a card to filter what needs to be done.</p>
    </section>
  );
}
