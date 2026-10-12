import { InputError, bool, num, oneOf, type Endpoint, type Input } from "./agent-api";
import { AIRPORTS, DISCLAIMER, LINES, PAYMENTS, RuleInputError, checkLuggage } from "./luggage";
import { SITE_NAME, SITE_TAGLINE } from "./site";

export const PUBLIC_URL = "https://japan-luggage.vercel.app";
export const API_DISCLAIMER = DISCLAIMER;
export const API_INFO = { title: `${SITE_NAME} API`, description: SITE_TAGLINE, version: "1.0.0" };

export const EXAMPLE_GET = "/api/check?lengthCm=75&widthCm=50&heightCm=30&weightKg=22&from=tokyo&to=kyoto&line=tokaido";

function optNum(input: Input, key: string): number | undefined {
  const raw = input[key];
  if (raw === undefined || raw === null || raw === "") return undefined;
  return num(input, key);
}
function optStr(input: Input, key: string): string | null {
  const raw = input[key];
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === undefined || v === null || String(v).trim() === "") return null;
  return String(v).trim();
}

export function computeCheck(input: Input) {
  try {
    const pieces = optNum(input, "pieces");
    if (pieces !== undefined && !Number.isInteger(pieces)) throw new InputError("pieces must be a whole number");
    const lineRaw = optStr(input, "line");
    return checkLuggage({
      bag: {
        lengthCm: optNum(input, "lengthCm"),
        widthCm: optNum(input, "widthCm"),
        heightCm: optNum(input, "heightCm"),
        totalCm: optNum(input, "totalCm"),
        weightKg: optNum(input, "weightKg") ?? null,
      },
      pieces,
      from: optStr(input, "from"),
      to: optStr(input, "to"),
      payment: oneOf(input, "payment", PAYMENTS, "cash"),
      dropOff: bool(input, "dropOff", false),
      line: lineRaw ? oneOf({ line: lineRaw.toLowerCase() }, "line", LINES) : "tokaido",
      departureDate: optStr(input, "departureDate"),
    });
  } catch (e) {
    if (e instanceof RuleInputError) throw new InputError(e.message);
    throw e;
  }
}

export const ENDPOINTS: Record<"check", Endpoint> = {
  check: {
    path: "/api/check",
    operationId: "japanLuggageCheck",
    summary: "Japan suitcase check: Shinkansen oversized-baggage rule + Yamato TA-Q-BIN forwarding cost (current 2025-10 rates)",
    description:
      "For a bag's outside dimensions (length + width + height incl. wheels) and weight: (1) Shinkansen rule — on the Tokaido, Sanyo, Kyushu and Nishi-Kyushu Shinkansen bags of 161–250 cm need a reserved oversized-baggage seat (free; ¥1,000 fee if unreserved), over 250 cm / 30 kg not allowed; JR East-area lines (Tohoku, Hokuriku, Joetsu, etc.) have no reservation. (2) Yamato TA-Q-BIN size class (60–200, larger of size or weight) and the one-way price between any two prefectures, or to an airport with Airport TA-Q-BIN (+¥660, send 2 days before departure), from Yamato's current cash and cashless tables (revised 2025-10-01; Yamato's English table is outdated). Returns verdict, prices, send-by date, recommendation, sources, rulesAsOf, disclaimer.",
    params: [
      { name: "lengthCm", type: "number", description: "Outside length in cm incl. wheels/handles. With widthCm + heightCm, or use totalCm." },
      { name: "widthCm", type: "number", description: "Outside width in cm." },
      { name: "heightCm", type: "number", description: "Outside depth/height in cm." },
      { name: "totalCm", type: "number", description: "Length + width + height in cm, if you only know the total (e.g. 158)." },
      { name: "weightKg", type: "number", description: "Packed weight in kg. Optional; Yamato uses the larger of size and weight class." },
      { name: "pieces", type: "integer", minimum: 1, maximum: 20, default: 1, description: "Number of identical bags." },
      { name: "from", type: "string", description: "Origin: prefecture (tokyo, kyoto, 東京都), common city (hakone, kanazawa, hiroshima), or airport id." },
      { name: "to", type: "string", description: `Destination: prefecture, city, or airport id (${AIRPORTS.map((a) => a.id).join(", ")}) for Airport TA-Q-BIN.` },
      { name: "line", type: "string", enum: LINES, default: "tokaido", description: "Shinkansen line you will ride, or none." },
      { name: "payment", type: "string", enum: PAYMENTS, default: "cash", description: "cash or cashless (credit card, QR, e-money, Apple Pay: cheaper)." },
      { name: "dropOff", type: "boolean", default: false, description: "You bring the bag to a Yamato office, agency or convenience store (¥100 off). Hotel front desk / pickup = false." },
      { name: "departureDate", type: "string", description: "YYYY-MM-DD flight date when sending to an airport; returns the send-by date." },
    ],
    example: EXAMPLE_GET,
    compute: computeCheck,
  },
};

export const PLUGIN = {
  name: "Japan Luggage Check",
  nameForModel: "japan_luggage_check",
  descriptionForHuman: "Can my suitcase go on the Shinkansen, and what does forwarding it with Yamato cost?",
  descriptionForModel:
    "Use when a Japan traveler asks whether a suitcase fits on the Shinkansen, whether they need an oversized baggage reservation, or how much it costs to forward luggage (TA-Q-BIN / takkyubin / hands-free travel) between cities or to Narita, Haneda or Kansai airport. Deterministic: official JR rules and Yamato's current tables (revised 2025-10-01; many sites and Yamato's own English page still show older, lower prices). Relay the disclaimer: estimate, Yamato's quote is final.",
  logo: "/icon.svg",
};
