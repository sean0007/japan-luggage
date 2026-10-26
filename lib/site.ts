export const SITE_NAME = "Japan Luggage Check";

export const SITE_TAGLINE =
  "Will your suitcase fit on the Shinkansen, and what does it cost to forward it? Bags over 160 cm need an oversized-baggage seat on the Tokaido, Sanyo and Kyushu Shinkansen (¥1,000 fee if you skip it). Yamato TA-Q-BIN from Tokyo to Kyoto for a Size 160 suitcase is ¥3,160 cash / ¥2,870 cashless at current rates.";

export const DISCLAIMER_SHORT = "Educational estimate, not official. Yamato's quote, your receipt and JR station staff are final; rates and rules can change.";

export const HONESTY =
  "Rates from Yamato Transport's Japanese cash and cashless tables (revised 2025-10-01, checked 2026-10-12); JR rules from JR Central, JR West, JR Kyushu and JR East. Not affiliated with Yamato, JR, or any airport.";

export const SIBLING_TOOLS = [
  { href: "https://japan-trip-brain.vercel.app", label: "Japan Trip Brain" },
  { href: "https://japan-tax-free-refund.vercel.app", label: "Japan Tax-Free Refund" },
  { href: "https://japan-visa-fee.vercel.app", label: "Japan Visa Fee" },
  { href: "https://kyushu-travel-discount.vercel.app", label: "Kyushu Travel Discount" },
  { href: "https://japan-customs-allowance.vercel.app", label: "Japan Customs Allowance" },
  { href: "https://japan-tb-screening.vercel.app", label: "Japan TB Screening (JPETS)" },
  { href: "https://japan-dual-pricing.vercel.app", label: "Japan Dual Pricing" },
  { href: "https://japan-alert-decoder.vercel.app", label: "Japan Alert Decoder" },
  { href: "https://japan-pr-check.vercel.app", label: "Japan PR Guideline Check" },
  { href: "https://japan-intl-postage.vercel.app", label: "Japan International Postage 2027" },
  { href: "https://japan-reentry-check.vercel.app", label: "Japan Re-entry Deadline Check" },
  { href: "https://japan-overseas-dependents.vercel.app", label: "Japan Overseas Dependents Check" },
  { href: "https://hotel-ota-calculator.vercel.app", label: "Hotel OTA Calculator" },
  { href: "https://pitch-roast.vercel.app", label: "Pitch Roast" },
  { href: "https://saas-bill-cutter.vercel.app", label: "SaaS Bill Cutter" },
  { href: "https://free-agent-tools.vercel.app", label: "Free Agent Tools MCP" },
] as const;

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production.replace(/^https?:\/\//, "")}`;
  return "https://japan-luggage.vercel.app";
}
