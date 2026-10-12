import { ImageResponse } from "next/og";
import { checkLuggage } from "@/lib/luggage";
import { EXAMPLE_SHARED, parseShared, toInput, yen } from "@/lib/share";

export async function GET(req: Request) {
  const shared = parseShared(new URL(req.url).searchParams) ?? EXAMPLE_SHARED;
  let r;
  try {
    r = checkLuggage(toInput(shared));
  } catch {
    r = checkLuggage(toInput(EXAMPLE_SHARED));
  }
  const sk = r.shinkansen;
  const verdict = sk ? (sk.verdict === "ok" ? "OK to carry on" : sk.verdict === "reserve_oversized_seat" ? "Reserve oversized seat" : "Too big to carry on") : "Luggage check";
  const color = sk?.verdict === "ok" ? "#99f6e4" : sk?.verdict === "reserve_oversized_seat" ? "#f0b429" : "#fda4af";
  const f = r.forwarding as { accepted?: boolean; perBagJPY?: number; from?: string; to?: string; sizeClass?: string } | null;
  const stats = [
    { label: "total size", value: `${r.bag.totalCm} cm` },
    { label: "Yamato size", value: r.bag.yamatoSize ?? "n/a" },
    { label: f?.accepted ? `forward ${String(f.from).split(" (")[0]} → ${String(f.to).split(" (")[0]}` : "rules as of", value: f?.accepted ? yen(f.perBagJPY!) : r.rulesAsOf },
  ];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#07080c", color: "#f3efe4", padding: "56px 64px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: "0.24em", textTransform: "uppercase", color: "#f0b429" }}>Japan Luggage Check</div>
          <div style={{ display: "flex", fontSize: 22, color: "#9b9588" }}>{sk ? sk.lineLabel.split(" (")[0] : "Yamato TA-Q-BIN"}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 32, color: "#c9c3b6" }}>
            {shared.lengthCm} × {shared.widthCm} × {shared.heightCm} cm{shared.weightKg !== null ? ` · ${shared.weightKg} kg` : ""}
          </div>
          <div style={{ display: "flex", marginTop: 6, fontSize: 100, fontWeight: 800, letterSpacing: "-0.04em", color, lineHeight: 1 }}>{verdict}</div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", flex: 1, border: "2px solid #23252c", borderRadius: 24, padding: "14px 20px", background: "#101218" }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: "#f3efe4" }}>{s.value}</span>
              <span style={{ fontSize: 20, color: "#9b9588" }}>{s.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: "#6f6a60" }}>
          <span>japan-luggage.vercel.app · free, no login</span>
          <span>Estimate. Yamato and JR staff are final.</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" } },
  );
}
