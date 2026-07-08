import { cn } from "@/lib/utils";

interface BlurredPhotoHeroProps {
  image: string;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}

/** Full-bleed photo with blur + optional sharp layer and gradient wash. */
export function BlurredPhotoHero({
  image,
  children,
  className,
  overlayClassName,
}: BlurredPhotoHeroProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-[0.7]"
        />
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-b from-white/90 via-white/84 to-[#f6f6f3]/92",
            overlayClassName
          )}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface KioskBackdropProps {
  image?: string;
}

/** Fixed full-viewport blurred photo for kiosk screens. */
export function KioskBackdrop({ image }: KioskBackdropProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full scale-105 object-cover blur-3xl brightness-[0.55]"
      />
      <div className="absolute inset-0 bg-[#f4f6f5]/96" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/98 via-[#f6f6f3]/95 to-[#eef4f3]/98" />
    </div>
  );
}
