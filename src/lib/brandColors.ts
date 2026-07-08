/**
 * Gateway brand greens — sampled from the official logo icon.
 * Mint (#7BDCB5) is the bright leaf; darker shades are used for accessible UI chrome.
 */
export const brandColors = {
  mint: "#7BDCB5",
  primary: "#3A8F6E",
  primaryDark: "#2D7259",
  primaryDeeper: "#1F5F49",
  greenMid: "#55B896",
  greenLight: "#6BC4A8",
  greenMuted: "#8FD4BC",
  /** Logo sun accent — used sparingly for contrast (e.g. painting category). */
  orange: "#F7941D",
} as const;

/** HSL triplets for CSS custom properties (no hsl() wrapper). */
export const brandHsl = {
  mint: "156 58% 67%",
  primary: "156 41% 40%",
  primaryDark: "156 43% 31%",
  primaryLight: "156 48% 48%",
} as const;
