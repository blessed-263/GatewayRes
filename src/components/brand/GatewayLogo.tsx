import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";

interface GatewayLogoProps {
  variant?: "default" | "light";
  className?: string;
  height?: number;
}

export function GatewayLogo({
  variant = "default",
  className,
  height = 36,
}: GatewayLogoProps) {
  const src = variant === "light" ? brand.logoLight : brand.logo;

  return (
    <img
      src={src}
      alt="Gateway Student Accommodation"
      className={cn("w-auto max-w-full object-contain", className)}
      style={{ height }}
      decoding="async"
    />
  );
}
