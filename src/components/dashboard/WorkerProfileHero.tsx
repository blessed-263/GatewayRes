import { format, parseISO } from "date-fns";
import { getDepartmentInfo, getTeamProfileByName } from "@/data/teamProfiles";

interface WorkerProfileHeroProps {
  workerName: string;
}

export function WorkerProfileHero({ workerName }: WorkerProfileHeroProps) {
  const profile = getTeamProfileByName(workerName);
  const firstName = workerName.split(" ")[0] ?? workerName;

  if (!profile) {
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

  const department = getDepartmentInfo(profile.department);
  const joined = format(parseISO(profile.joinedAt), "d MMM yyyy");

  return (
    <section className="rounded-[1.75rem] border border-primary/15 bg-primary px-6 py-7 text-primary-foreground sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
        {department?.label ?? profile.department}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{profile.name}</h1>
      <p className="mt-2 text-lg font-medium text-white/95">{profile.role}</p>
      <p className="mt-1 text-base text-white/85">{profile.workType}</p>
      <p className="mt-4 text-sm text-white/75">
        Joined {joined} · {profile.buildings.join(" · ")}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {profile.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold text-white"
          >
            {skill}
          </span>
        ))}
      </div>
      <p className="mt-5 text-sm text-white/75">Tap a card below to filter what needs to be done.</p>
    </section>
  );
}
