/**
 * Admin "Warm Editorial Luxury" design tokens.
 *
 * Single source of truth for the admin panel's palette, surfaces, shadows and
 * status colors. Derived from the brand palette in `colors.ts` but refined for a
 * cream-canvas / brown-ink / gold-accent editorial look.
 *
 * Use these JS values where Tailwind classes can't reach: recharts props,
 * data-keyed status colors, alpha-composited fills. For static markup prefer the
 * `admin-*` Tailwind utilities and the CSS vars in `admin-theme.css`, which mirror
 * these exact values.
 */

export const adminTheme = {
  surface: {
    canvas: "#F5F1E8", // warm paper — the page behind cards
    surface: "#FFFFFF", // cards & panels
    surfaceMuted: "#FBF7EF", // zebra rows / hover
    surfaceSunken: "#F0EADD", // inset areas / skeleton base
    overlay: "rgba(58, 42, 24, 0.45)", // brown-tinted modal scrim
  },
  ink: {
    heading: "#8B4513", // brand brown — headings, wordmark
    body: "#3D2F23", // espresso — paragraphs, table cells
    muted: "#7C6248", // labels, secondary text
    subtle: "#A8917A", // hints, placeholders, disabled
    onAccent: "#FBF7EF", // text on brown/gold fills
  },
  line: {
    hairline: "#E7DBC6", // warm beige divider (the signature 1px rule)
    gold: "#C9A227", // refined brass-gold — active rails, accent rules
  },
  accent: {
    gold: "#C9A227",
    goldSoft: "rgba(201, 162, 39, 0.12)",
    goldBg: "#F3E9CC", // soft gold tint for badges/chips
    brown: "#8B4513",
    brownSoft: "rgba(139, 69, 19, 0.10)", // icon chips (replaces `${brown}20`)
    brownHover: "#743A10", // primary button hover
  },
  shadow: {
    card: "0 1px 2px rgba(80,50,20,0.04), 0 6px 16px -4px rgba(80,50,20,0.08)",
    cardHover:
      "0 2px 4px rgba(80,50,20,0.06), 0 12px 28px -6px rgba(80,50,20,0.12)",
    popover: "0 8px 24px -6px rgba(58,42,24,0.18)",
  },
  radius: { sm: 6, md: 10, lg: 14, pill: 999 },
} as const;

export type StatusToken = { bg: string; text: string; dot: string };

/**
 * One status/badge color map for the whole admin — replaces the duplicated
 * dashboard `STATUS_STYLES`, the orders `ORDER_STATUS_BADGE`, and the scattered
 * stock / active / deleted badge classes. Tones stay semantic (green=good,
 * red=danger, amber=attention) but are desaturated to sit on cream.
 */
export const ADMIN_STATUS_TOKENS: Record<string, StatusToken> = {
  // order lifecycle
  under_review: { bg: "#F6ECCB", text: "#7A5B12", dot: "#C9A227" },
  pending: { bg: "#F6ECCB", text: "#7A5B12", dot: "#C9A227" },
  confirmed: { bg: "#EAE4F0", text: "#564a78", dot: "#7A6CA8" },
  processing: { bg: "#EAE4F0", text: "#564a78", dot: "#7A6CA8" },
  ordered: { bg: "#E7ECF3", text: "#3A5A78", dot: "#5B7FA0" },
  shipped: { bg: "#E5ECF2", text: "#3A5A78", dot: "#5B7FA0" },
  delivered: { bg: "#E4EFE2", text: "#3F6B3A", dot: "#5C8A52" },
  cancelled: { bg: "#F4E0DC", text: "#8A3324", dot: "#B4503C" },
  refunded: { bg: "#F1E2E8", text: "#84395A", dot: "#A85B79" },
  // generic admin states
  active: { bg: "#E4EFE2", text: "#3F6B3A", dot: "#5C8A52" },
  inactive: { bg: "#EFE7D8", text: "#6B5640", dot: "#9A7B5E" },
  deleted: { bg: "#F4E0DC", text: "#8A3324", dot: "#B4503C" },
  soldOut: { bg: "#F4E0DC", text: "#8A3324", dot: "#B4503C" },
  inStock: { bg: "#E4EFE2", text: "#3F6B3A", dot: "#5C8A52" },
  lowStock: { bg: "#F6ECCB", text: "#7A5B12", dot: "#C9A227" },
  bestSeller: { bg: "#F3E9CC", text: "#7A5B12", dot: "#C9A227" },
  discount: { bg: "#F3E9CC", text: "#7A5B12", dot: "#C9A227" },
  default: { bg: "#EFE7D8", text: "#6B5640", dot: "#9A7B5E" },
};

/** Resolve a status key to its token, falling back to the neutral `default`. */
export const statusToken = (key?: string | null): StatusToken =>
  (key && ADMIN_STATUS_TOKENS[key]) || ADMIN_STATUS_TOKENS.default;

/** "under_review" → "Under Review" */
export const formatStatusLabel = (status: string): string =>
  status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
