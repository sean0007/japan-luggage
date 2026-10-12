"use client";

import { useState } from "react";
import { CardDisclaimer } from "@/components/card-disclaimer";
import { ShareBar } from "@/components/share-bar";
import { AIRPORTS, LINES, LINE_LABEL, PREFECTURES, checkLuggage, type Line, type Payment } from "@/lib/luggage";
import { EXAMPLE_SHARED, PUBLIC_URL, resultPath, toInput, yen, type Shared } from "@/lib/share";

const field = "mt-2 w-full rounded-xl border border-line bg-black/40 px-3 py-2 text-sm text-foreground focus:border-amber";

const PRESETS = [
  { label: "Carry-on (55×40×25)", l: 55, w: 40, h: 25, kg: 8 },
  { label: "24-inch (65×45×27)", l: 65, w: 45, h: 27, kg: 17 },
  { label: "28-inch (75×50×30)", l: 75, w: 50, h: 30, kg: 22 },
  { label: "30-inch+ (80×55×35)", l: 80, w: 55, h: 35, kg: 27 },
];

function PlaceSelect({ value, onChange, label, allowAirport }: { value: string; onChange: (v: string) => void; label: string; allowAirport: boolean }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={field}>
        {allowAirport && (
          <optgroup label="Airport (Airport TA-Q-BIN)">
            {AIRPORTS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </optgroup>
        )}
        <optgroup label="Prefecture (hotel / home)">
          {PREFECTURES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.en} ({p.ja})
            </option>
          ))}
        </optgroup>
      </select>
    </label>
  );
}

export function Calculator({ initial }: { initial?: Shared }) {
  const start = initial ?? EXAMPLE_SHARED;
  const [l, setL] = useState(String(start.lengthCm));
  const [w, setW] = useState(String(start.widthCm));
  const [h, setH] = useState(String(start.heightCm));
  const [kg, setKg] = useState(start.weightKg === null ? "" : String(start.weightKg));
  const [from, setFrom] = useState(start.from);
  const [to, setTo] = useState(start.to);
  const [line, setLine] = useState<Line>(start.line);
  const [payment, setPayment] = useState<Payment>(start.payment);
  const [dropOff, setDropOff] = useState(start.dropOff);
  const [pieces, setPieces] = useState(String(start.pieces));
  const [dep, setDep] = useState(start.departureDate ?? "");

  const clamp = (s: string) => Math.max(1, Math.min(400, Math.round(Number(s) || 0)));
  const kgN = kg.trim() === "" ? null : Number(kg);
  const shared: Shared = {
    lengthCm: clamp(l),
    widthCm: clamp(w),
    heightCm: clamp(h),
    weightKg: kgN !== null && Number.isFinite(kgN) && kgN > 0 && kgN <= 200 ? Math.round(kgN * 10) / 10 : null,
    from,
    to,
    line,
    payment,
    pieces: Math.max(1, Math.min(20, Math.floor(Number(pieces) || 1))),
    dropOff,
    departureDate: /^\d{4}-\d{2}-\d{2}$/.test(dep) ? dep : null,
  };
  const result = (() => {
    try {
      return checkLuggage(toInput(shared));
    } catch {
      return null;
    }
  })();
  const toAirport = AIRPORTS.some((a) => a.id === to);
  const shareUrl = `${PUBLIC_URL}${resultPath(shared)}`;
  const fwd = result?.forwarding as (Record<string, unknown> & { accepted: boolean }) | null | undefined;
  const sk = result?.shinkansen;
  const verdictColor = sk?.verdict === "ok" ? "text-teal-200" : sk?.verdict === "reserve_oversized_seat" ? "text-amber" : "text-rose-300";
  const verdictText = sk ? (sk.verdict === "ok" ? "OK to carry on" : sk.verdict === "reserve_oversized_seat" ? "Reserve an oversized-baggage seat" : "Too big to carry on") : "No Shinkansen";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="rounded-3xl border border-line bg-panel/60 p-5 sm:p-6">
        <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">Your bag (outside, incl. wheels)</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setL(String(p.l));
                setW(String(p.w));
                setH(String(p.h));
                setKg(String(p.kg));
              }}
              className="rounded-full border border-line px-3 py-1 text-xs text-muted hover:border-amber/50 hover:text-foreground"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {[
            ["Length cm", l, setL],
            ["Width cm", w, setW],
            ["Depth cm", h, setH],
            ["Weight kg", kg, setKg],
          ].map(([label, v, set]) => (
            <label key={label as string} className="block">
              <span className="text-xs font-medium text-foreground">{label as string}</span>
              <input inputMode="decimal" value={v as string} onChange={(e) => (set as (s: string) => void)(e.target.value)} className={`${field} font-mono`} />
            </label>
          ))}
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-medium text-foreground">Shinkansen you will ride</span>
          <select value={line} onChange={(e) => setLine(e.target.value as Line)} className={field}>
            {LINES.map((x) => (
              <option key={x} value={x}>
                {LINE_LABEL[x]}
              </option>
            ))}
          </select>
        </label>

        <p className="mt-6 font-mono text-[11px] tracking-[0.22em] text-muted uppercase">Or forward it with Yamato (TA-Q-BIN)</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <PlaceSelect label="From" value={from} onChange={setFrom} allowAirport={false} />
          <PlaceSelect label="To" value={to} onChange={setTo} allowAirport />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-foreground">Pay</span>
            <select value={payment} onChange={(e) => setPayment(e.target.value as Payment)} className={field}>
              <option value="cash">Cash</option>
              <option value="cashless">Card / QR / e-money</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Bags</span>
            <input inputMode="numeric" value={pieces} onChange={(e) => setPieces(e.target.value)} className={`${field} font-mono`} />
          </label>
          {toAirport ? (
            <label className="block">
              <span className="text-sm font-medium text-foreground">Flight date</span>
              <input type="date" value={dep} onChange={(e) => setDep(e.target.value)} className={`${field} font-mono`} />
            </label>
          ) : (
            <label className="mt-7 flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={dropOff} onChange={(e) => setDropOff(e.target.checked)} /> I drop it at a store (−¥100)
            </label>
          )}
        </div>
      </div>

      <article data-testid="result-card" className="relative flex flex-col overflow-hidden rounded-3xl border border-line bg-black/50 lg:sticky lg:top-16 lg:self-start">
        <div className="p-5 sm:p-7">
          {result ? (
            <>
              <p className="font-mono text-[11px] tracking-[0.22em] text-muted uppercase">
                {result.bag.totalCm} cm total{result.bag.weightKg !== null ? ` · ${result.bag.weightKg} kg` : ""} · Yamato size {result.bag.yamatoSize ?? "not accepted"}
              </p>
              <h2 className={`mt-2 font-display text-4xl ${verdictColor}`}>{verdictText}</h2>
              {sk && <p className="mt-2 text-sm text-muted">{sk.summary}</p>}
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                {fwd && fwd.accepted && (
                  <>
                    <div className="col-span-2 rounded-2xl border border-teal-200/30 bg-teal-200/5 p-3">
                      <dt className="text-xs text-muted">
                        {String(fwd.service)} · {String(fwd.from)} → {String(fwd.to)}
                      </dt>
                      <dd className="mt-1 font-display text-4xl text-teal-200">{yen(fwd.perBagJPY as number)}</dd>
                      <dd className="text-xs text-muted">
                        per bag, Size {String(fwd.sizeClass)}, {payment}
                        {(fwd.pieces as number) > 1 ? ` · ${String(fwd.pieces)} bags = ${yen(fwd.totalJPY as number)}` : ""}
                      </dd>
                    </div>
                    <div className="rounded-2xl border border-line p-3">
                      <dt className="text-xs text-muted">Cash / cashless</dt>
                      <dd className="font-mono text-foreground">
                        {yen(fwd.cashJPY as number)} / {yen(fwd.cashlessJPY as number)}
                      </dd>
                    </div>
                    <div className="rounded-2xl border border-line p-3">
                      <dt className="text-xs text-muted">{fwd.sendByDate ? "Send by" : "Timing"}</dt>
                      <dd className="font-mono text-foreground">{fwd.sendByDate ? String(fwd.sendByDate) : toAirport ? "2 days before flight" : "send day before"}</dd>
                    </div>
                  </>
                )}
                {fwd && !fwd.accepted && (
                  <div className="col-span-2 rounded-2xl border border-rose-300/30 bg-rose-300/5 p-3">
                    <dt className="text-xs text-muted">TA-Q-BIN</dt>
                    <dd className="text-foreground">{String(fwd.reason)}</dd>
                  </div>
                )}
                {sk?.fitsOversizedCompartment && sk.verdict === "reserve_oversized_seat" && (
                  <div className="col-span-2 rounded-2xl border border-amber/30 bg-amber/5 p-3">
                    <dt className="text-xs text-muted">Fits the lockable oversized compartment?</dt>
                    <dd className="text-foreground">
                      Upper (80×60×50): {sk.fitsOversizedCompartment.upper ? "yes" : "no"} · Lower (80×60×40): {sk.fitsOversizedCompartment.lower ? "yes" : "no"}
                    </dd>
                  </div>
                )}
              </dl>
              <p className="mt-5 text-sm font-medium text-foreground">{result.recommendation}</p>
              <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-muted">
                {result.notes.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span className="text-amber">·</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-line pt-4" data-testid="share-result">
                <p className="text-xs text-muted">Share this result. The link carries only these numbers and places; nothing is stored.</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <ShareBar
                    url={shareUrl}
                    text={`My ${result.bag.totalCm} cm suitcase in Japan: ${verdictText.toLowerCase()} on the Shinkansen${fwd && fwd.accepted ? `, forwarding ${yen(fwd.perBagJPY as number)}` : ""}. Free checker:`}
                  />
                  <a href={resultPath(shared)} className="text-sm text-muted underline underline-offset-2 hover:text-foreground">
                    Open result page
                  </a>
                </div>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted">Enter the bag&apos;s length, width and depth in cm.</p>
          )}
        </div>
        <CardDisclaimer />
      </article>
    </div>
  );
}
