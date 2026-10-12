// Japan luggage rules + Yamato TA-Q-BIN forwarding cost. Deterministic, dated, official sources.
import RATES_RAW from "./yamato-rates.json";

export const RULES_AS_OF = "2026-10-12";
export const YAMATO_RATES_EFFECTIVE = "2025-10-01";

export const DISCLAIMER =
  "Educational estimate, not official. Built from Yamato Transport's published TA-Q-BIN rate tables (revised 2025-10-01, checked 2026-10-12) and JR luggage rules. Not affiliated with Yamato, JR, or any airport. The counter receipt, Yamato's own quote, and station staff are final; rules and rates can change.";

export const SOURCES = [
  "https://www.kuronekoyamato.co.jp/ytc/search/estimate/ichiran.html",
  "https://www.kuronekoyamato.co.jp/ytc/search/estimate/ichiran_cashless.html",
  "https://www.kuronekoyamato.co.jp/ytc/en/send/services/takkyubin/",
  "https://www.kuronekoyamato.co.jp/ytc/en/send/services/airport/",
  "https://global.jr-central.co.jp/en/info/oversized-baggage/index.html",
  "https://www.westjr.co.jp/travel-information/en/train-usage-guide/luggage/",
  "https://www.jrkyushu.co.jp/english/guide/oversized_baggage.html",
  "https://www.jreast.co.jp/en/multi/luggage-area/",
] as const;

export class RuleInputError extends Error {}

export const REGIONS = [
  "Hokkaido",
  "Northern Tohoku",
  "Southern Tohoku",
  "Kanto",
  "Shinetsu",
  "Hokuriku",
  "Chubu",
  "Kansai",
  "Chugoku",
  "Shikoku",
  "Kyushu",
  "Okinawa",
] as const;
export type Region = (typeof REGIONS)[number];

export type Prefecture = { id: string; en: string; ja: string; region: Region };

const P = (id: string, en: string, ja: string, region: Region): Prefecture => ({ id, en, ja, region });
export const PREFECTURES: Prefecture[] = [
  P("hokkaido", "Hokkaido", "北海道", "Hokkaido"),
  P("aomori", "Aomori", "青森県", "Northern Tohoku"),
  P("akita", "Akita", "秋田県", "Northern Tohoku"),
  P("iwate", "Iwate", "岩手県", "Northern Tohoku"),
  P("miyagi", "Miyagi", "宮城県", "Southern Tohoku"),
  P("yamagata", "Yamagata", "山形県", "Southern Tohoku"),
  P("fukushima", "Fukushima", "福島県", "Southern Tohoku"),
  P("ibaraki", "Ibaraki", "茨城県", "Kanto"),
  P("tochigi", "Tochigi", "栃木県", "Kanto"),
  P("gunma", "Gunma", "群馬県", "Kanto"),
  P("saitama", "Saitama", "埼玉県", "Kanto"),
  P("chiba", "Chiba", "千葉県", "Kanto"),
  P("kanagawa", "Kanagawa", "神奈川県", "Kanto"),
  P("tokyo", "Tokyo", "東京都", "Kanto"),
  P("yamanashi", "Yamanashi", "山梨県", "Kanto"),
  P("niigata", "Niigata", "新潟県", "Shinetsu"),
  P("nagano", "Nagano", "長野県", "Shinetsu"),
  P("toyama", "Toyama", "富山県", "Hokuriku"),
  P("ishikawa", "Ishikawa", "石川県", "Hokuriku"),
  P("fukui", "Fukui", "福井県", "Hokuriku"),
  P("shizuoka", "Shizuoka", "静岡県", "Chubu"),
  P("aichi", "Aichi", "愛知県", "Chubu"),
  P("mie", "Mie", "三重県", "Chubu"),
  P("gifu", "Gifu", "岐阜県", "Chubu"),
  P("osaka", "Osaka", "大阪府", "Kansai"),
  P("kyoto", "Kyoto", "京都府", "Kansai"),
  P("shiga", "Shiga", "滋賀県", "Kansai"),
  P("nara", "Nara", "奈良県", "Kansai"),
  P("wakayama", "Wakayama", "和歌山県", "Kansai"),
  P("hyogo", "Hyogo", "兵庫県", "Kansai"),
  P("okayama", "Okayama", "岡山県", "Chugoku"),
  P("hiroshima", "Hiroshima", "広島県", "Chugoku"),
  P("yamaguchi", "Yamaguchi", "山口県", "Chugoku"),
  P("tottori", "Tottori", "鳥取県", "Chugoku"),
  P("shimane", "Shimane", "島根県", "Chugoku"),
  P("kagawa", "Kagawa", "香川県", "Shikoku"),
  P("tokushima", "Tokushima", "徳島県", "Shikoku"),
  P("ehime", "Ehime", "愛媛県", "Shikoku"),
  P("kochi", "Kochi", "高知県", "Shikoku"),
  P("fukuoka", "Fukuoka", "福岡県", "Kyushu"),
  P("saga", "Saga", "佐賀県", "Kyushu"),
  P("nagasaki", "Nagasaki", "長崎県", "Kyushu"),
  P("kumamoto", "Kumamoto", "熊本県", "Kyushu"),
  P("oita", "Oita", "大分県", "Kyushu"),
  P("miyazaki", "Miyazaki", "宮崎県", "Kyushu"),
  P("kagoshima", "Kagoshima", "鹿児島県", "Kyushu"),
  P("okinawa", "Okinawa", "沖縄県", "Okinawa"),
];

/** Common city names travelers type, mapped to their prefecture. */
const CITY_ALIASES: Record<string, string> = {
  sapporo: "hokkaido", niseko: "hokkaido", hakodate: "hokkaido", sendai: "miyagi", nikko: "tochigi",
  yokohama: "kanagawa", hakone: "kanagawa", kamakura: "kanagawa", "mt fuji": "yamanashi", kawaguchiko: "yamanashi", fujikawaguchiko: "yamanashi",
  karuizawa: "nagano", hakuba: "nagano", matsumoto: "nagano", kanazawa: "ishikawa", takayama: "gifu", "shirakawa-go": "gifu", shirakawago: "gifu",
  nagoya: "aichi", ise: "mie", kobe: "hyogo", himeji: "hyogo", "kyoto city": "kyoto", uji: "kyoto", "osaka city": "osaka",
  hiroshima: "hiroshima", miyajima: "hiroshima", naoshima: "kagawa", takamatsu: "kagawa", matsuyama: "ehime", hakata: "fukuoka", beppu: "oita",
  naha: "okinawa", ishigaki: "okinawa", miyakojima: "okinawa",
};

export type Airport = { id: string; name: string; prefectureId: string };
export const AIRPORTS: Airport[] = [
  { id: "haneda", name: "Haneda Airport (HND, Tokyo)", prefectureId: "tokyo" },
  { id: "narita", name: "Narita Airport (NRT, Chiba)", prefectureId: "chiba" },
  { id: "kix", name: "Kansai International Airport (KIX, Osaka)", prefectureId: "osaka" },
  { id: "itami", name: "Osaka Itami Airport (ITM)", prefectureId: "osaka" },
  { id: "centrair", name: "Chubu Centrair Airport (NGO, Aichi)", prefectureId: "aichi" },
  { id: "new-chitose", name: "New Chitose Airport (CTS, Hokkaido)", prefectureId: "hokkaido" },
  { id: "fukuoka-airport", name: "Fukuoka Airport (FUK)", prefectureId: "fukuoka" },
  { id: "naha-airport", name: "Naha Airport (OKA, Okinawa)", prefectureId: "okinawa" },
];
const AIRPORT_ALIASES: Record<string, string> = {
  hnd: "haneda", "haneda airport": "haneda", nrt: "narita", "narita airport": "narita", kansai: "kix", "kansai airport": "kix", "kansai international": "kix",
  itm: "itami", "itami airport": "itami", ngo: "centrair", chubu: "centrair", cts: "new-chitose", "new chitose": "new-chitose", chitose: "new-chitose",
  fuk: "fukuoka-airport", oka: "naha-airport", "naha airport": "naha-airport",
};

export const AIRPORT_FEE_JPY = 660;
export const DROP_OFF_DISCOUNT_JPY = 100;

export type SizeClass = { id: "60" | "80" | "100" | "120" | "140" | "160" | "180" | "200"; maxCm: number; maxKg: number };
export const SIZES: SizeClass[] = [
  { id: "60", maxCm: 60, maxKg: 2 },
  { id: "80", maxCm: 80, maxKg: 5 },
  { id: "100", maxCm: 100, maxKg: 10 },
  { id: "120", maxCm: 120, maxKg: 15 },
  { id: "140", maxCm: 140, maxKg: 20 },
  { id: "160", maxCm: 160, maxKg: 25 },
  { id: "180", maxCm: 180, maxKg: 30 },
  { id: "200", maxCm: 200, maxKg: 30 },
];
export const MAX_SIDE_CM = 170;

type RateRow = { same: number | null; to: number[] };
type RateTable = Record<Region, Record<string, RateRow>>;
const RATES = RATES_RAW as unknown as { cash: RateTable; cashless: RateTable };

export const LINES = ["tokaido", "sanyo", "kyushu", "nishi-kyushu", "tohoku", "hokkaido", "joetsu", "hokuriku", "yamagata", "akita", "none"] as const;
export type Line = (typeof LINES)[number];
export const RESERVATION_LINES: Line[] = ["tokaido", "sanyo", "kyushu", "nishi-kyushu"];
export const LINE_LABEL: Record<Line, string> = {
  tokaido: "Tokaido Shinkansen (Tokyo–Nagoya–Kyoto–Shin-Osaka)",
  sanyo: "Sanyo Shinkansen (Shin-Osaka–Hiroshima–Hakata)",
  kyushu: "Kyushu Shinkansen (Hakata–Kagoshima-Chuo)",
  "nishi-kyushu": "Nishi-Kyushu Shinkansen (Takeo-Onsen–Nagasaki)",
  tohoku: "Tohoku Shinkansen (Tokyo–Sendai–Shin-Aomori)",
  hokkaido: "Hokkaido Shinkansen (Shin-Aomori–Shin-Hakodate-Hokuto)",
  joetsu: "Joetsu Shinkansen (Tokyo–Niigata)",
  hokuriku: "Hokuriku Shinkansen (Tokyo–Nagano–Kanazawa–Tsuruga)",
  yamagata: "Yamagata Shinkansen",
  akita: "Akita Shinkansen",
  none: "No Shinkansen",
};
export const PAYMENTS = ["cash", "cashless"] as const;
export type Payment = (typeof PAYMENTS)[number];

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/[\s_]+/g, " ").replace(/ (prefecture|pref\.?|city|ken|fu|to)$/i, "").trim();
}

export function findPrefecture(raw: string): Prefecture | null {
  const n = norm(raw);
  if (!n) return null;
  const alias = CITY_ALIASES[n];
  const id = alias ?? n.replace(/ /g, "-");
  return PREFECTURES.find((p) => p.id === id || p.en.toLowerCase() === n || p.ja === raw.trim() || p.ja.replace(/[都道府県]$/, "") === raw.trim()) ?? null;
}

export function findAirport(raw: string): Airport | null {
  const n = norm(raw).replace(/ airport$/, " airport");
  const id = AIRPORT_ALIASES[n] ?? n.replace(/ /g, "-");
  return AIRPORTS.find((a) => a.id === id) ?? null;
}

export type Place = { kind: "prefecture"; prefecture: Prefecture } | { kind: "airport"; airport: Airport; prefecture: Prefecture };

export function resolvePlace(raw: string, field: string): Place {
  const a = findAirport(raw);
  if (a) return { kind: "airport", airport: a, prefecture: PREFECTURES.find((p) => p.id === a.prefectureId)! };
  const p = findPrefecture(raw);
  if (p) return { kind: "prefecture", prefecture: p };
  throw new RuleInputError(`Unknown ${field}: "${raw}". Use a prefecture (tokyo, kyoto, osaka, 東京都), a common city (hakone, kanazawa, hiroshima), or an airport id (${AIRPORTS.map((x) => x.id).join(", ")}).`);
}

export type Bag = { lengthCm?: number; widthCm?: number; heightCm?: number; totalCm?: number; weightKg?: number | null };

export function bagDims(b: Bag): { totalCm: number; sides: number[] | null } {
  const sides = [b.lengthCm, b.widthCm, b.heightCm];
  if (sides.every((x) => typeof x === "number" && x > 0)) {
    const s = (sides as number[]).map((x) => Math.round(x * 10) / 10);
    return { totalCm: Math.round(s.reduce((a, c) => a + c, 0) * 10) / 10, sides: [...s].sort((a, c) => c - a) };
  }
  if (typeof b.totalCm === "number" && b.totalCm > 0) return { totalCm: Math.round(b.totalCm * 10) / 10, sides: null };
  throw new RuleInputError("Give the bag's lengthCm, widthCm and heightCm (outside, incl. wheels and handles), or totalCm (length + width + height).");
}

export function yamatoSize(totalCm: number, weightKg: number | null | undefined, longestSideCm: number | null) {
  if (longestSideCm !== null && longestSideCm > MAX_SIDE_CM) return { size: null, by: "longest_side" as const, reason: `Longest side ${longestSideCm} cm is over Yamato's ${MAX_SIDE_CM} cm limit.` };
  const byDim = SIZES.find((s) => totalCm <= s.maxCm) ?? null;
  const byKg = weightKg === null || weightKg === undefined ? SIZES[0] : SIZES.find((s) => weightKg <= s.maxKg) ?? null;
  if (!byDim) return { size: null, by: "dimensions" as const, reason: `${totalCm} cm is over TA-Q-BIN's 200 cm maximum.` };
  if (!byKg) return { size: null, by: "weight" as const, reason: `${weightKg} kg is over TA-Q-BIN's 30 kg maximum.` };
  const di = SIZES.indexOf(byDim);
  const ki = SIZES.indexOf(byKg);
  const size = SIZES[Math.max(di, ki)];
  return { size, by: ki > di ? ("weight" as const) : ("dimensions" as const), reason: null };
}

export function rateFor(fromRegion: Region, toRegion: Region, sizeId: string, payment: Payment, samePrefecture: boolean): number {
  const row = RATES[payment][fromRegion][sizeId];
  if (samePrefecture && row.same !== null && fromRegion !== "Okinawa") return row.same;
  return row.to[REGIONS.indexOf(toRegion)];
}

export function shinkansenCheck(line: Line, totalCm: number, sides: number[] | null, weightKg: number | null | undefined, pieces: number) {
  const overGeneral = totalCm > 250 || (sides !== null && sides[0] > 200) || (typeof weightKg === "number" && weightKg > 30);
  const tooMany = pieces > 2;
  const fitsUpper = sides ? sides[0] <= 80 && sides[1] <= 60 && sides[2] <= 50 : null;
  const fitsLower = sides ? sides[0] <= 80 && sides[1] <= 60 && sides[2] <= 40 : null;
  if (line === "none") return null;
  const needsReservationLine = RESERVATION_LINES.includes(line);
  let verdict: "ok" | "reserve_oversized_seat" | "not_allowed";
  let summary: string;
  if (overGeneral) {
    verdict = "not_allowed";
    summary = "Over JR's free carry-on limit (each piece max 250 cm total, 2 m long, 30 kg). Forward it instead.";
  } else if (needsReservationLine && totalCm > 160) {
    verdict = "reserve_oversized_seat";
    summary = `${totalCm} cm is over 160 cm: on the ${LINE_LABEL[line].split(" (")[0]} you must reserve a "seat with an oversized baggage area" (or compartment) when you buy the ticket. No extra charge; without it staff can charge ¥1,000 and move the bag.`;
  } else if (needsReservationLine) {
    verdict = "ok";
    summary = `${totalCm} cm is 160 cm or less: no reservation needed. Use the overhead rack, your feet, or the deck baggage area.`;
  } else {
    verdict = "ok";
    summary = `JR East-area lines (${LINE_LABEL[line].split(" (")[0]}) have no oversized-baggage reservation; space is first come, first served and some trains have no luggage area.`;
  }
  return {
    line,
    lineLabel: LINE_LABEL[line],
    verdict,
    reservationRequired: verdict === "reserve_oversized_seat",
    unreservedOversizeFeeJPY: needsReservationLine && verdict === "reserve_oversized_seat" ? 1000 : 0,
    tooManyPieces: tooMany,
    fitsOversizedCompartment: needsReservationLine && (line === "tokaido" || line === "sanyo" || line === "kyushu" || line === "nishi-kyushu") ? { upper: fitsUpper, lower: fitsLower } : null,
    summary: tooMany && verdict !== "not_allowed" ? `${summary} JR allows 2 free carry-on pieces per person; ${pieces} is over.` : summary,
  };
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export type LuggageInput = {
  bag: Bag;
  pieces?: number;
  from?: string | null;
  to?: string | null;
  payment?: Payment;
  dropOff?: boolean;
  line?: Line;
  departureDate?: string | null;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function checkLuggage(input: LuggageInput) {
  const pieces = input.pieces ?? 1;
  if (!Number.isInteger(pieces) || pieces < 1 || pieces > 20) throw new RuleInputError("pieces must be a whole number from 1 to 20.");
  const { totalCm, sides } = bagDims(input.bag);
  if (totalCm > 1000) throw new RuleInputError("totalCm looks wrong (over 1000 cm). Use centimetres.");
  const weightKg = input.bag.weightKg ?? null;
  if (weightKg !== null && (!(weightKg > 0) || weightKg > 200)) throw new RuleInputError("weightKg must be between 0 and 200.");
  const payment = input.payment ?? "cash";
  const line = input.line ?? "tokaido";
  const longest = sides ? sides[0] : null;
  const ys = yamatoSize(totalCm, weightKg, longest);

  const shinkansen = shinkansenCheck(line, totalCm, sides, weightKg, pieces);

  let forwarding: Record<string, unknown> | null = null;
  const notes: string[] = [];
  if (input.from && input.to) {
    const from = resolvePlace(input.from, "from");
    const to = resolvePlace(input.to, "to");
    if (from.kind === "airport" && to.kind === "airport") throw new RuleInputError("Both from and to are airports; give at least one prefecture or city.");
    const toAirport = to.kind === "airport";
    const samePref = !toAirport && from.kind === "prefecture" && from.prefecture.id === to.prefecture.id && from.prefecture.region !== "Okinawa";
    const fromRegion = from.prefecture.region;
    const toRegion = to.prefecture.region;
    if (ys.size) {
      const sizeId = ys.size.id;
      const base = (pay: Payment) => rateFor(fromRegion, toRegion, sizeId, pay, samePref) + (toAirport ? AIRPORT_FEE_JPY : 0);
      const cash = base("cash");
      const cashless = base("cashless");
      const chosen = payment === "cash" ? cash : cashless;
      const discount = input.dropOff ? DROP_OFF_DISCOUNT_JPY : 0;
      const perBag = chosen - discount;
      const sendBy = toAirport && input.departureDate && DATE.test(input.departureDate) ? addDays(input.departureDate, -2) : null;
      forwarding = {
        accepted: true,
        service: toAirport ? "Airport TA-Q-BIN (空港宅急便)" : "TA-Q-BIN (宅急便)",
        from: from.kind === "airport" ? from.airport.name : `${from.prefecture.en} (${from.prefecture.ja})`,
        to: to.kind === "airport" ? to.airport.name : `${to.prefecture.en} (${to.prefecture.ja})`,
        fromRegion,
        toRegion,
        samePrefectureRate: samePref,
        sizeClass: sizeId,
        sizeDecidedBy: ys.by,
        cashJPY: cash,
        cashlessJPY: cashless,
        payment,
        dropOffDiscountJPY: discount,
        airportFeeIncludedJPY: toAirport ? AIRPORT_FEE_JPY : 0,
        perBagJPY: perBag,
        pieces,
        totalJPY: perBag * pieces,
        cashlessSavesPerBagJPY: cash - cashless,
        sendByDate: sendBy,
        timing: toAirport
          ? "Hand the bag over by 2 days before departure (3 days in some areas) so it reaches the departure airport the day before. Pick it up at the airport's Yamato/partner counter on departure day."
          : "Next-day delivery is common between nearby regions but not guaranteed; Hokkaido, Kyushu, Okinawa and remote areas can take 2+ days. Send it the morning before you need it and keep one night of essentials.",
      };
      if (pieces > 1 && !toAirport) notes.push("Yamato's multiple-parcel ¥100 reduction does not apply to suitcases or travel bags of Size 160 or larger.");
      if (sizeId === "180" || sizeId === "200") notes.push("Size 180 and 200 cannot be sent from some convenience stores; use a Yamato office or hotel front desk.");
    } else {
      forwarding = { accepted: false, reason: ys.reason, service: "TA-Q-BIN (宅急便)", suggestion: "Not accepted as normal TA-Q-BIN. Ask Yamato about other services or split the load." };
    }
  }

  let recommendation: string;
  if (shinkansen?.verdict === "not_allowed") recommendation = "Forward this bag; it is too big or heavy to carry on JR.";
  else if (shinkansen?.verdict === "reserve_oversized_seat") recommendation = `Either reserve an oversized-baggage seat (free with a reserved-seat ticket) or forward the bag${forwarding && forwarding.accepted ? ` for about ¥${(forwarding.perBagJPY as number).toLocaleString("en-US")}` : ""}.`;
  else if (forwarding && forwarding.accepted) recommendation = `You can carry it on. Forwarding costs about ¥${(forwarding.perBagJPY as number).toLocaleString("en-US")} per bag if you'd rather travel hands-free.`;
  else recommendation = "You can carry it on this line. Add from and to for a forwarding price.";

  if (weightKg === null) notes.push("No weight given: size class uses dimensions only. Over 25 kg moves a bag to Size 180 (30 kg max).");
  if (!sides) notes.push("Only totalCm given: oversized-compartment fit (80×60×50 cm upper / 80×60×40 cm lower) and Yamato's 170 cm longest-side limit were not checked.");
  notes.push("Yamato rates are tax included, one way, per parcel. Bringing the bag to a Yamato office, agency or convenience store takes ¥100 off; Kuroneko Members get extra discounts.");
  notes.push("Yamato's English 'all regions' rate page still shows pre-October-2025 prices; this tool uses the current Japanese cash and cashless tables.");

  return {
    bag: { totalCm, sidesCm: sides, weightKg, pieces, yamatoSize: ys.size?.id ?? null, yamatoSizeDecidedBy: ys.size ? ys.by : null, yamatoAccepted: !!ys.size, yamatoRejectReason: ys.reason },
    shinkansen,
    forwarding,
    recommendation,
    notes,
    rulesAsOf: RULES_AS_OF,
    yamatoRatesEffective: YAMATO_RATES_EFFECTIVE,
    sources: [...SOURCES],
  };
}

export const RULES = {
  rulesAsOf: RULES_AS_OF,
  shinkansen: {
    reservationLines: RESERVATION_LINES.map((l) => LINE_LABEL[l]),
    reservationRule: "Bags with total length + width + height of 161–250 cm need a reserved 'seat with an oversized baggage area' (last row) or oversized-baggage compartment seat; no extra charge beyond a reserved-seat ticket. Without a reservation staff can charge ¥1,000 (tax incl.) and move the bag. Over 250 cm cannot be brought on board.",
    compartmentLimits: { upperCm: [80, 60, 50], lowerCm: [80, 60, 40], note: "Tokaido/Sanyo 16-car trains and JR Kyushu; locks with an IC card." },
    jrEastLines: "Tohoku, Hokkaido, Joetsu, Hokuriku, Yamagata and Akita Shinkansen: no oversized-baggage reservation; first come, first served.",
    generalCarryOn: "JR free carry-on: up to 2 pieces per person, each up to 250 cm total, 2 m long, 30 kg.",
  },
  yamato: {
    ratesEffective: YAMATO_RATES_EFFECTIVE,
    sizes: SIZES,
    maxSideCm: MAX_SIDE_CM,
    dropOffDiscountJPY: DROP_OFF_DISCOUNT_JPY,
    airportFeeJPY: AIRPORT_FEE_JPY,
    airportTiming: "Send by 2 days before departure (3 in some areas); delivered to the departure airport the day before.",
    regions: Object.fromEntries(REGIONS.map((r) => [r, PREFECTURES.filter((p) => p.region === r).map((p) => p.en)])),
    cash: RATES.cash,
    cashless: RATES.cashless,
    tableNote: "Each row: same = same-prefecture rate (not from Okinawa, not to airports), to = rate to each region in the order of `regions`.",
  },
  airports: AIRPORTS,
  sources: [...SOURCES],
  disclaimer: DISCLAIMER,
};
