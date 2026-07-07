import { cn } from "@/lib/utils";

interface EmptyStateProps {
  image: string;
  imageAlt: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  image,
  imageAlt,
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-6 py-12 text-center",
        className
      )}
    >
      <div className="mb-6 overflow-hidden rounded-2xl">
        <img
          src={image}
          alt={imageAlt}
          className="h-36 w-56 object-cover object-center opacity-90 sm:h-44 sm:w-72"
          loading="lazy"
        />
      </div>
      <h3 className="font-heading text-lg font-medium tracking-tight">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
