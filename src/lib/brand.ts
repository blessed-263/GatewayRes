import { brandColors } from "@/lib/brandColors";

/** Official Gateway brand assets from gatewayres.co.za */
export const brand = {
  logo: "/brand/gateway-logo.png",
  logoLight: "/brand/gateway-logo-light.png",
  favicon32: "/brand/favicon-32.webp",
  favicon192: "/brand/favicon-192.webp",
  appleTouchIcon: "/brand/apple-touch-icon.webp",
  siteUrl: "https://gatewayres.co.za/",
  themeColor: brandColors.mint,
  colors: brandColors,
} as const;
