import assert from "node:assert/strict";
import test from "node:test";
import { EXAMPLE_SHARED, isExample, parseShared, resultPath, sharedQuery, toInput } from "./share";
import { checkLuggage } from "./luggage";

test("example shared round-trips", () => {
  const back = parseShared(new URLSearchParams(sharedQuery(EXAMPLE_SHARED)));
  assert.deepEqual(back, EXAMPLE_SHARED);
  assert.ok(back && isExample(back));
  assert.equal(resultPath(EXAMPLE_SHARED), "/r?l=75&w=50&h=30&kg=22&f=tokyo&t=kyoto&line=tokaido");
});

test("parseShared accepts API-style names, options round-trip", () => {
  const s = parseShared({ lengthCm: "80", widthCm: "55", heightCm: "35", weightKg: "27", from: "osaka", to: "kix", line: "sanyo", payment: "cashless", pieces: "2", dropOff: "true", departureDate: "2026-11-20" });
  assert.ok(s);
  assert.deepEqual(parseShared(new URLSearchParams(sharedQuery(s!))), s);
  const r = checkLuggage(toInput(s!));
  assert.equal(r.forwarding?.sendByDate, "2026-11-18");
});

test("parseShared rejects junk", () => {
  assert.equal(parseShared({ l: "abc", w: "1", h: "1" }), null);
  assert.equal(parseShared({}), null);
  assert.equal(parseShared({ l: "70", w: "50", h: "30", f: "<script>" }), null);
});
