import { LINES, PAYMENTS, type Line, type Payment } from "./luggage";

export const PUBLIC_URL = "https://japan-luggage.vercel.app";

/** Share links: /r?l=75&w=50&h=30&kg=22&f=tokyo&t=kyoto&line=tokaido&pay=cash&n=1&drop=1&dep=YYYY-MM-DD */
type Params = URLSearchParams | Record<string, string | string[] | undefined>;
function one(p: Params, key: string): string | undefined {
  if (p instanceof URLSearchParams) return p.get(key) ?? undefined;
  const v = p[key];
  return Array.isArray(v) ? v[0] : v;
}
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const PLACE = /^[a-z][a-z-]{1,24}$/;

export type Shared = {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightKg: number | null;
  from: string;
  to: string;
  line: Line;
  payment: Payment;
  pieces: number;
  dropOff: boolean;
  departureDate: string | null;
};

export const EXAMPLE_SHARED: Shared = { lengthCm: 75, widthCm: 50, heightCm: 30, weightKg: 22, from: "tokyo", to: "kyoto", line: "tokaido", payment: "cash", pieces: 1, dropOff: false, departureDate: null };

function dim(v: string | undefined): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 && n <= 400 ? Math.round(n) : null;
}

export function parseShared(p: Params): Shared | null {
  const l = dim(one(p, "l") ?? one(p, "lengthCm"));
  const w = dim(one(p, "w") ?? one(p, "widthCm"));
  const h = dim(one(p, "h") ?? one(p, "heightCm"));
  if (l === null || w === null || h === null) return null;
  const kgRaw = one(p, "kg") ?? one(p, "weightKg");
  const kgN = kgRaw === undefined || kgRaw === "" ? null : Number(kgRaw);
  const weightKg = kgN !== null && Number.isFinite(kgN) && kgN > 0 && kgN <= 200 ? Math.round(kgN * 10) / 10 : null;
  const from = (one(p, "f") ?? one(p, "from") ?? "tokyo").toLowerCase();
  const to = (one(p, "t") ?? one(p, "to") ?? "kyoto").toLowerCase();
  if (!PLACE.test(from) || !PLACE.test(to)) return null;
  const lineRaw = one(p, "line") ?? "tokaido";
  const line = (LINES as readonly string[]).includes(lineRaw) ? (lineRaw as Line) : "tokaido";
  const payRaw = one(p, "pay") ?? one(p, "payment") ?? "cash";
  const payment = (PAYMENTS as readonly string[]).includes(payRaw) ? (payRaw as Payment) : "cash";
  const nRaw = Number(one(p, "n") ?? one(p, "pieces") ?? "1");
  const pieces = Number.isInteger(nRaw) && nRaw >= 1 && nRaw <= 20 ? nRaw : 1;
  const dropOff = /^(1|true)$/.test(one(p, "drop") ?? one(p, "dropOff") ?? "");
  const d = one(p, "dep") ?? one(p, "departureDate");
  const departureDate = d && DATE.test(d) ? d : null;
  return { lengthCm: l, widthCm: w, heightCm: h, weightKg, from, to, line, payment, pieces, dropOff, departureDate };
}

export function sharedQuery(s: Shared): string {
  const q = new URLSearchParams();
  q.set("l", String(s.lengthCm));
  q.set("w", String(s.widthCm));
  q.set("h", String(s.heightCm));
  if (s.weightKg !== null) q.set("kg", String(s.weightKg));
  q.set("f", s.from);
  q.set("t", s.to);
  q.set("line", s.line);
  if (s.payment !== "cash") q.set("pay", s.payment);
  if (s.pieces !== 1) q.set("n", String(s.pieces));
  if (s.dropOff) q.set("drop", "1");
  if (s.departureDate) q.set("dep", s.departureDate);
  return q.toString();
}

export const resultPath = (s: Shared) => `/r?${sharedQuery(s)}`;
export const ogPath = (s: Shared) => `/og?${sharedQuery(s)}`;
export const isExample = (s: Shared) => sharedQuery(s) === sharedQuery(EXAMPLE_SHARED);
export const yen = (n: number) => `¥${Math.round(n).toLocaleString("en-US")}`;

export function toInput(s: Shared) {
  return {
    bag: { lengthCm: s.lengthCm, widthCm: s.widthCm, heightCm: s.heightCm, weightKg: s.weightKg },
    pieces: s.pieces,
    from: s.from,
    to: s.to,
    payment: s.payment,
    dropOff: s.dropOff,
    line: s.line,
    departureDate: s.departureDate,
  };
}
