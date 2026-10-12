import type { Metadata } from "next";
import { SOURCES } from "@/lib/luggage";
import { DISCLAIMER_SHORT, HONESTY } from "@/lib/site";

export const metadata: Metadata = { title: "Disclaimer", description: DISCLAIMER_SHORT };

export default function DisclaimerPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Read this</p>
      <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">Disclaimer</h1>
      <p className="mt-4 text-lg text-foreground">{DISCLAIMER_SHORT}</p>
      <p className="mt-2 text-muted">{HONESTY}</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-base font-semibold text-foreground">What this is</h2>
          <p className="mt-2">
            A free educational checker. It applies the published Shinkansen luggage rules of JR Central, JR West, JR Kyushu and JR East to a bag&apos;s size and weight, and looks up Yamato Transport&apos;s TA-Q-BIN and Airport TA-Q-BIN prices from a dated copy of Yamato&apos;s Japanese cash and cashless rate tables (revised 2025-10-01, checked 2026-10-12).
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">What it is not</h2>
          <p className="mt-2">
            It is not an official quote and not affiliated with Yamato, any JR company, or any airport. Yamato&apos;s counter price and receipt, and JR station staff, are final. Delivery times are not guaranteed, oversized-baggage seats can sell out, and remote-area surcharges, special services (Golf, Ski, Cool TA-Q-BIN), member discounts and same-day hands-free services are not modelled. Rates and rules can change; check the official sources below.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {SOURCES.map((s) => (
              <li key={s}>
                <a href={s} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Your data</h2>
          <p className="mt-2">Numbers you enter stay in your browser (or in a share link you create). No login, no addresses, no database.</p>
        </section>
      </div>
    </div>
  );
}
