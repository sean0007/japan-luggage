import assert from "node:assert/strict";
import test from "node:test";
import { AIRPORTS, PREFECTURES, REGIONS, RULES, checkLuggage, findPrefecture, rateFor, resolvePlace, yamatoSize } from "./luggage";

const bag = (l: number, w: number, h: number, kg: number | null = null) => ({ lengthCm: l, widthCm: w, heightCm: h, weightKg: kg });

test("47 prefectures, 12 regions, every region has a rate row for every size", () => {
  assert.equal(PREFECTURES.length, 47);
  assert.equal(new Set(PREFECTURES.map((p) => p.id)).size, 47);
  for (const pay of ["cash", "cashless"] as const) {
    const t = (RULES.yamato as unknown as Record<string, Record<string, Record<string, { to: number[] }>>>)[pay];
    for (const r of REGIONS) for (const s of ["60", "80", "100", "120", "140", "160", "180", "200"]) assert.equal(t[r][s].to.length, 12, `${pay} ${r} ${s}`);
  }
});

test("official spot checks (Yamato cash/cashless tables, revised 2025-10-01)", () => {
  assert.equal(rateFor("Kanto", "Kansai", "160", "cash", false), 3160);
  assert.equal(rateFor("Kanto", "Kansai", "160", "cashless", false), 2870);
  assert.equal(rateFor("Kanto", "Kanto", "160", "cash", false), 3020);
  assert.equal(rateFor("Kanto", "Kanto", "160", "cash", true), 2410);
  assert.equal(rateFor("Hokkaido", "Okinawa", "200", "cash", false), 10730);
  assert.equal(rateFor("Kansai", "Hokkaido", "160", "cash", false), 4180);
  // symmetric table
  for (const a of REGIONS) for (const b of REGIONS) assert.equal(rateFor(a, b, "140", "cash", false), rateFor(b, a, "140", "cash", false));
});

test("size class is the larger of dimensions and weight", () => {
  assert.equal(yamatoSize(155, 22, 75).size?.id, "160");
  assert.equal(yamatoSize(100, 24, 50).size?.id, "160");
  assert.equal(yamatoSize(100, 24, 50).by, "weight");
  assert.equal(yamatoSize(160, 25, 70).size?.id, "160");
  assert.equal(yamatoSize(161, 10, 70).size?.id, "180");
  assert.equal(yamatoSize(150, 26, 70).size?.id, "180");
  assert.equal(yamatoSize(200, 30, 90).size?.id, "200");
  assert.equal(yamatoSize(201, 10, 90).size, null);
  assert.equal(yamatoSize(150, 31, 70).size, null);
  assert.equal(yamatoSize(190, 10, 171).size, null);
});

test("28-inch suitcase Tokyo→Kyoto on Tokaido: carry on OK, Size 160 ¥3,160 cash", () => {
  const r = checkLuggage({ bag: bag(75, 50, 30, 22), from: "tokyo", to: "kyoto", line: "tokaido" });
  assert.equal(r.bag.totalCm, 155);
  assert.equal(r.shinkansen?.verdict, "ok");
  assert.equal(r.forwarding?.perBagJPY, 3160);
  assert.equal(r.forwarding?.cashlessJPY, 2870);
  assert.equal(r.forwarding?.sizeClass, "160");
  assert.ok(r.sources.length >= 5);
});

test("161–250 cm on Tokaido/Sanyo/Kyushu needs oversized seat; ¥1,000 if unreserved", () => {
  for (const line of ["tokaido", "sanyo", "kyushu", "nishi-kyushu"] as const) {
    const r = checkLuggage({ bag: bag(80, 55, 35), line });
    assert.equal(r.shinkansen?.verdict, "reserve_oversized_seat", line);
    assert.equal(r.shinkansen?.unreservedOversizeFeeJPY, 1000);
  }
  const at160 = checkLuggage({ bag: { totalCm: 160 }, line: "tokaido" });
  assert.equal(at160.shinkansen?.verdict, "ok");
  const at161 = checkLuggage({ bag: { totalCm: 161 }, line: "sanyo" });
  assert.equal(at161.shinkansen?.verdict, "reserve_oversized_seat");
});

test("JR East lines: no reservation even at 200 cm; over 250 cm or 30 kg not allowed anywhere", () => {
  assert.equal(checkLuggage({ bag: { totalCm: 200 }, line: "tohoku" }).shinkansen?.verdict, "ok");
  assert.equal(checkLuggage({ bag: { totalCm: 200 }, line: "hokuriku" }).shinkansen?.reservationRequired, false);
  assert.equal(checkLuggage({ bag: { totalCm: 251 }, line: "tohoku" }).shinkansen?.verdict, "not_allowed");
  assert.equal(checkLuggage({ bag: bag(70, 50, 30, 31), line: "tokaido" }).shinkansen?.verdict, "not_allowed");
  assert.equal(checkLuggage({ bag: { totalCm: 120 }, line: "none" }).shinkansen, null);
});

test("oversized compartment fit (80×60×50 upper, 80×60×40 lower)", () => {
  const r = checkLuggage({ bag: bag(78, 58, 45), line: "tokaido" });
  assert.deepEqual(r.shinkansen?.fitsOversizedCompartment, { upper: true, lower: false });
});

test("Airport TA-Q-BIN adds ¥660, no same-prefecture rate, send-by = departure − 2 days", () => {
  const r = checkLuggage({ bag: bag(75, 50, 30, 22), from: "tokyo", to: "narita", departureDate: "2026-11-03" });
  assert.equal(r.forwarding?.service, "Airport TA-Q-BIN (空港宅急便)");
  assert.equal(r.forwarding?.perBagJPY, 3020 + 660);
  assert.equal(r.forwarding?.sendByDate, "2026-11-01");
  const kix = checkLuggage({ bag: bag(75, 50, 30, 22), from: "osaka", to: "kix" });
  assert.equal(kix.forwarding?.samePrefectureRate, false);
  assert.equal(kix.forwarding?.perBagJPY, 3020 + 660);
});

test("same-prefecture rate within a prefecture, not from Okinawa", () => {
  assert.equal(checkLuggage({ bag: bag(75, 50, 30), from: "tokyo", to: "tokyo" }).forwarding?.perBagJPY, 2410);
  const oki = checkLuggage({ bag: bag(75, 50, 30), from: "okinawa", to: "okinawa" });
  assert.equal(oki.forwarding?.samePrefectureRate, false);
});

test("drop-off discount, cashless, and pieces multiply", () => {
  const r = checkLuggage({ bag: bag(75, 50, 30, 22), from: "tokyo", to: "kyoto", payment: "cashless", dropOff: true, pieces: 2 });
  assert.equal(r.forwarding?.perBagJPY, 2870 - 100);
  assert.equal(r.forwarding?.totalJPY, 2 * 2770);
});

test("over-size bag is not accepted for TA-Q-BIN", () => {
  const r = checkLuggage({ bag: bag(100, 70, 40), from: "tokyo", to: "osaka" });
  assert.equal(r.bag.yamatoAccepted, false);
  assert.equal(r.forwarding?.accepted, false);
});

test("place resolution: names, Japanese, cities, airports", () => {
  assert.equal(findPrefecture("Tokyo")?.id, "tokyo");
  assert.equal(findPrefecture("東京都")?.id, "tokyo");
  assert.equal(findPrefecture("京都")?.id, "kyoto");
  assert.equal(findPrefecture("Hakone")?.id, "kanagawa");
  assert.equal(findPrefecture("Kyoto Prefecture")?.id, "kyoto");
  assert.equal(resolvePlace("Haneda Airport", "to").kind, "airport");
  assert.equal(resolvePlace("KIX", "to").kind, "airport");
  assert.equal(AIRPORTS.length, 8);
  assert.throws(() => resolvePlace("atlantis", "to"));
});

test("bad input throws", () => {
  assert.throws(() => checkLuggage({ bag: {} }));
  assert.throws(() => checkLuggage({ bag: bag(70, 50, 30), pieces: 0 }));
  assert.throws(() => checkLuggage({ bag: bag(70, 50, 30), from: "narita", to: "haneda" }));
});
