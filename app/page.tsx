import type { Metadata } from "next";
import { Calculator } from "@/components/calculator";
import { FaqSection, type FaqItem } from "@/components/faq-section";
import { AIRPORT_FEE_JPY, PREFECTURES, rateFor } from "@/lib/luggage";
import { EXAMPLE_SHARED, PUBLIC_URL, resultPath, yen } from "@/lib/share";

const title = "Japan luggage check: Shinkansen suitcase size rule and Yamato luggage forwarding cost (2026)";
const description =
  "Free Japan suitcase checker: does your bag need an oversized-baggage seat on the Shinkansen (over 160 cm on Tokaido, Sanyo, Kyushu), and what does Yamato TA-Q-BIN luggage forwarding cost between any two prefectures or to Narita, Haneda and Kansai airport at current rates. Free JSON API for AI agents. Not official.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description },
  twitter: { card: "summary_large_image", title, description },
};

const reg = (id: string) => PREFECTURES.find((p) => p.id === id)!.region;
const r = (a: string, b: string, size: string, pay: "cash" | "cashless" = "cash") => rateFor(reg(a), reg(b), size, pay, a === b);

const ROUTES: [string, string, string][] = [
  ["Tokyo", "tokyo", "kyoto"],
  ["Tokyo", "tokyo", "osaka"],
  ["Tokyo", "tokyo", "hiroshima"],
  ["Tokyo", "tokyo", "ishikawa"],
  ["Tokyo", "tokyo", "hokkaido"],
  ["Kyoto", "kyoto", "osaka"],
  ["Osaka", "osaka", "fukuoka"],
  ["Tokyo", "tokyo", "okinawa"],
];
const nameOf = (id: string) => (id === "ishikawa" ? "Kanazawa (Ishikawa)" : id === "hokkaido" ? "Sapporo (Hokkaido)" : PREFECTURES.find((p) => p.id === id)!.en);

const webAppLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Japan Luggage Check",
  alternateName: ["Shinkansen luggage size checker", "Japan luggage forwarding cost calculator"],
  url: PUBLIC_URL,
  applicationCategory: "TravelApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
  description:
    "Unofficial, free checker for Japan travelers: Shinkansen oversized-baggage rule by line and Yamato TA-Q-BIN / Airport TA-Q-BIN forwarding price from Yamato's current cash and cashless tables, with a keyless JSON API.",
};

const tk = r("tokyo", "kyoto", "160");
const tkc = r("tokyo", "kyoto", "160", "cashless");
const faq: FaqItem[] = [
  {
    q: "Can I bring a large suitcase on the Shinkansen?",
    a: "Yes, but on the Tokaido, Sanyo, Kyushu and Nishi-Kyushu Shinkansen any bag whose length + width + height is over 160 cm (up to 250 cm) needs a reserved 'seat with an oversized baggage area' or oversized-baggage compartment, booked when you buy the ticket at no extra charge. At 160 cm or less no reservation is needed. Over 250 cm cannot be brought on board on any line.",
  },
  {
    q: "What happens if I bring an oversized bag on the Shinkansen without a reservation?",
    a: "JR Central, JR West and JR Kyushu charge a ¥1,000 (tax included) baggage fee and staff may move your bag to a designated spot. Non-reserved cars have no oversized-baggage seats, so you cannot fix it by switching cars.",
  },
  {
    q: "Is a 28-inch suitcase over 160 cm?",
    a: "Usually not: a typical 28-inch case measures about 75 × 50 × 30 cm = 155 cm, just under the limit. Many 29–32-inch cases (for example 80 × 55 × 35 = 170 cm) are over. Measure the outside including wheels and handles; the manufacturer's 'size' often excludes them.",
  },
  {
    q: "Do the Tohoku and Hokuriku Shinkansen need an oversized luggage reservation?",
    a: "No. JR East-area lines (Tohoku, Hokkaido, Joetsu, Hokuriku, Yamagata, Akita) have no oversized-baggage reservation; luggage space is first come, first served and some trains have none. JR's general limit still applies: up to 2 free pieces per person, each up to 250 cm total, 2 m long and 30 kg.",
  },
  {
    q: "How much does it cost to send a suitcase from Tokyo to Kyoto with Yamato?",
    a: `For a Size 160 suitcase (up to 160 cm and 25 kg), Yamato TA-Q-BIN from Tokyo (Kanto) to Kyoto (Kansai) is ${yen(tk)} paid in cash or ${yen(tkc)} cashless at the rates in force since October 1, 2025, minus ¥100 if you drop it at a Yamato office or convenience store yourself. A Size 140 bag (up to 20 kg) is ${yen(r("tokyo", "kyoto", "140"))} cash. Yamato's English rate table still shows older, lower prices.`,
  },
  {
    q: "How is Yamato's luggage size calculated?",
    a: "Add the outside length, width and height in cm. Yamato uses the larger of the size class and the weight class: Size 60 (2 kg), 80 (5 kg), 100 (10 kg), 120 (15 kg), 140 (20 kg), 160 (25 kg), 180 (30 kg), 200 (30 kg). So a 150 cm bag that weighs 26 kg is Size 180. Over 200 cm, 30 kg, or a side longer than 170 cm is not accepted as normal TA-Q-BIN.",
  },
  {
    q: "How much is Airport TA-Q-BIN to Narita, Haneda or Kansai airport?",
    a: `The normal TA-Q-BIN rate plus a ¥${AIRPORT_FEE_JPY} airport fee per bag. For example a Size 160 suitcase from Tokyo to Narita is ${yen(r("tokyo", "chiba", "160") + AIRPORT_FEE_JPY)} cash, and from Kyoto to Kansai Airport ${yen(r("kyoto", "osaka", "160") + AIRPORT_FEE_JPY)} cash. The same-prefecture discount does not apply to airport deliveries.`,
  },
  {
    q: "When do I need to send my luggage to the airport?",
    a: "Yamato asks you to hand the bag over by 2 days before your departure date (3 days in some areas). It arrives at the departure airport the day before, and you collect it at the airport counter on departure day. Check the sending deadline at the counter you use.",
  },
  {
    q: "Does luggage forwarding arrive the next day in Japan?",
    a: "Between nearby regions (Tokyo–Kyoto, Osaka–Hiroshima) next-day delivery is common but not guaranteed; Hokkaido, Kyushu, Okinawa and remote areas can take 2 or more days. Send it the morning before you need it, keep one night of essentials with you, and confirm the delivery date at the counter.",
  },
  {
    q: "Is it cheaper to pay Yamato by card?",
    a: `Yes. Yamato's cashless rates (credit card, QR codes such as PayPay, e-money, Apple Pay) are lower than cash: ${yen(tkc)} vs ${yen(tk)} for Size 160 Tokyo→Kyoto. Bringing the bag to a Yamato office, agency or convenience store yourself takes another ¥100 off.`,
  },
  {
    q: "Should I forward my luggage or take it on the Shinkansen?",
    a: "If the bag is 160 cm or less, carrying it is free. If it is 161–250 cm, you can reserve an oversized-baggage seat for free, but those seats sell out in peak periods; forwarding (about ¥3,000 per suitcase on main routes) lets you travel hands-free, which is also kinder on crowded trains. Over 250 cm or 30 kg, forward it.",
  },
  {
    q: "Is there a free API for Japan luggage rules and Yamato forwarding prices?",
    a: `Yes, this one. Free, no key, CORS open: GET ${PUBLIC_URL}/api/check?lengthCm=75&widthCm=50&heightCm=30&weightKg=22&from=tokyo&to=kyoto&line=tokaido returns the Shinkansen verdict, Yamato size class, cash and cashless price, and sources. Full tables at ${PUBLIC_URL}/api/rules, OpenAPI at ${PUBLIC_URL}/openapi.json, and the japan_luggage_check tool on https://free-agent-tools.vercel.app/mcp.`,
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <section className="max-w-3xl">
        <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Free · Japan · current Yamato rates</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">Japan luggage check: Shinkansen suitcase rule and forwarding cost</h1>
        <p className="mt-4 max-w-2xl text-lg font-medium text-foreground sm:text-xl">Will my suitcase fit on the Shinkansen, and what does it cost to send it ahead?</p>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Over 160 cm needs an oversized-baggage seat on the Tokaido, Sanyo and Kyushu Shinkansen. Forwarding a Size 160 suitcase Tokyo → Kyoto costs {yen(tk)} cash, {yen(tkc)} by card. This free Japan luggage checker (calculator) takes your bag&apos;s size and weight and gives the Shinkansen rule and the forwarding cost.
        </p>
      </section>

      <section className="mt-8">
        <Calculator />
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Yamato TA-Q-BIN suitcase prices on popular routes</h2>
        <div className="mt-5 overflow-x-auto rounded-3xl border border-line">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-panel/80 text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium">Size 140 (20 kg)</th>
                <th className="px-4 py-3 font-medium">Size 160 (25 kg)</th>
                <th className="px-4 py-3 font-medium">Size 160 cashless</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ROUTES.map(([fromLabel, a, b]) => (
                <tr key={`${a}-${b}`}>
                  <td className="px-4 py-3">
                    {fromLabel} → {nameOf(b)}
                  </td>
                  <td className="px-4 py-3 font-mono">{yen(r(a, b, "140"))}</td>
                  <td className="px-4 py-3 font-mono">{yen(r(a, b, "160"))}</td>
                  <td className="px-4 py-3 font-mono text-muted">{yen(r(a, b, "160", "cashless"))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted">
          One way, per bag, tax included, Yamato rates in force since 2025-10-01 (cash unless noted). −¥100 if you drop it off yourself; +¥{AIRPORT_FEE_JPY} to an airport. Example shareable result:{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href={resultPath(EXAMPLE_SHARED)}>
            28-inch suitcase Tokyo → Kyoto
          </a>
          .
        </p>
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Agent-callable JSON API</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
          Free, no key, CORS open.{" "}
          <code className="rounded bg-panel px-1.5 py-0.5 font-mono text-xs text-foreground">GET {PUBLIC_URL}/api/check?totalCm=170&amp;weightKg=20&amp;from=kyoto&amp;to=kix&amp;line=tokaido</code> or POST JSON. Also{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href="/api/rules">/api/rules</a>,{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href="/openapi.json">/openapi.json</a>,{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href="/llms.txt">/llms.txt</a>, and the MCP tool on{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href="https://free-agent-tools.vercel.app/" target="_blank" rel="noopener noreferrer">
            free-agent-tools
          </a>
          .
        </p>
      </section>

      <FaqSection items={faq} heading="Japan luggage questions" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd).replace(/</g, "\\u003c") }} />
    </div>
  );
}
