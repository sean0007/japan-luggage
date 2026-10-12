import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Calculator } from "@/components/calculator";
import { checkLuggage } from "@/lib/luggage";
import { EXAMPLE_SHARED, PUBLIC_URL, isExample, ogPath, parseShared, resultPath, toInput, yen, type Shared } from "@/lib/share";
import { DISCLAIMER_SHORT, HONESTY } from "@/lib/site";

type SP = Promise<Record<string, string | string[] | undefined>>;

function safe(s: Shared) {
  try {
    return checkLuggage(toInput(s));
  } catch {
    return null;
  }
}

function headline(s: Shared, r: NonNullable<ReturnType<typeof safe>>) {
  const v = r.shinkansen?.verdict === "ok" ? "OK on the Shinkansen" : r.shinkansen?.verdict === "reserve_oversized_seat" ? "needs an oversized-baggage seat" : r.shinkansen ? "too big for the Shinkansen" : "luggage check";
  const f = r.forwarding && (r.forwarding as { accepted: boolean }).accepted ? `, forwarding ${yen((r.forwarding as { perBagJPY: number }).perBagJPY)}` : "";
  return `${r.bag.totalCm} cm suitcase ${v}${f}`;
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const shared = parseShared(await searchParams);
  const r = shared ? safe(shared) : null;
  if (!shared || !r) return { title: "Your result", robots: { index: false, follow: true } };
  const title = headline(shared, r);
  const description = `${r.shinkansen?.summary ?? ""} ${r.recommendation} Rules as of ${r.rulesAsOf}. Estimate only.`.trim();
  const url = `${PUBLIC_URL}${resultPath(shared)}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: isExample(shared) ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title: `Japan Luggage Check · ${title}`, description, type: "website", url, images: [{ url: ogPath(shared), width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title: `Japan Luggage Check · ${title}`, description, images: [ogPath(shared)] },
  };
}

export default async function ResultPage({ searchParams }: { searchParams: SP }) {
  const shared = parseShared(await searchParams);
  const r = shared ? safe(shared) : null;
  if (!shared || !r) redirect("/");
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <section className="max-w-3xl">
        <p className="font-mono text-[11px] tracking-[0.28em] text-amber uppercase">Shared result · Japan Luggage Check</p>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">{headline(shared, r)}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {r.recommendation} · rules as of {r.rulesAsOf}
        </p>
        <p className="mt-4 text-sm">
          <Link href="/" className="text-muted underline underline-offset-2 hover:text-foreground">
            ← Start over
          </Link>
          {isExample(shared) ? null : (
            <>
              {" · "}
              <Link href={resultPath(EXAMPLE_SHARED)} className="text-muted underline underline-offset-2 hover:text-foreground">
                Open the example
              </Link>
            </>
          )}
        </p>
      </section>
      <section className="mt-8">
        <Calculator initial={shared} />
      </section>
      <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted">
        {DISCLAIMER_SHORT} {HONESTY}
      </p>
    </div>
  );
}
