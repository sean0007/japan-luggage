import { ImageResponse } from "next/og";

export const alt = "Japan Luggage Check: Shinkansen suitcase rule and Yamato forwarding cost";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#07080c", color: "#f3efe4", padding: "64px", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
        <div style={{ display: "flex", fontSize: 22, letterSpacing: "0.28em", textTransform: "uppercase", color: "#f0b429" }}>Free · Japan · Current Yamato rates</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 64, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: 1050 }}>Will my suitcase fit on the Shinkansen?</div>
          <div style={{ display: "flex", fontSize: 30, color: "#9b9588", maxWidth: 1000, lineHeight: 1.35 }}>
            Over 160 cm needs an oversized-baggage seat (¥1,000 if you skip it) · Forward Tokyo → Kyoto ¥3,160 cash / ¥2,870 card
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 22, color: "#9b9588" }}>
          <span style={{ color: "#99f6e4" }}>Shinkansen rule by line</span>
          <span>TA-Q-BIN + Airport TA-Q-BIN</span>
          <span>Free JSON API · no login</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
