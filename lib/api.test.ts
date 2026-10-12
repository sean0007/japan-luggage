import assert from "node:assert/strict";
import test from "node:test";
import { apiHandler, openapiDoc, preflight } from "./agent-api";
import { API_DISCLAIMER, API_INFO, ENDPOINTS, EXAMPLE_GET, PUBLIC_URL } from "./api";

const e = ENDPOINTS.check;
const handler = apiHandler(e.compute, { disclaimer: API_DISCLAIMER, docs: `${PUBLIC_URL}/openapi.json`, example: `${PUBLIC_URL}${e.example}` });

test(`GET ${EXAMPLE_GET} returns ¥3,160 with disclaimer and CORS`, async () => {
  const res = await handler(new Request(`${PUBLIC_URL}${EXAMPLE_GET}`));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
  const body = await res.json();
  assert.equal(body.disclaimer, API_DISCLAIMER);
  assert.equal(body.forwarding.perBagJPY, 3160);
  assert.equal(body.shinkansen.verdict, "ok");
  assert.ok(body.sources.length);
});

test("POST JSON body matches GET", async () => {
  const url = new URL(`${PUBLIC_URL}${EXAMPLE_GET}`);
  const body = Object.fromEntries(url.searchParams);
  const post = await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
  const get = await handler(new Request(url));
  assert.equal(post.status, 200);
  assert.deepEqual(await post.json(), await get.json());
});

test("POST with numbers, totalCm only, airport, booleans", async () => {
  const res = await handler(new Request(`${PUBLIC_URL}${e.path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ totalCm: 170, weightKg: 20, from: "Kyoto", to: "kix", payment: "cashless", dropOff: true, line: "Tokaido", departureDate: "2026-12-20" }) }));
  assert.equal(res.status, 200);
  const b = await res.json();
  assert.equal(b.shinkansen.verdict, "reserve_oversized_seat");
  assert.equal(b.forwarding.sizeClass, "180");
  assert.equal(b.forwarding.sendByDate, "2026-12-18");
});

test("missing dimensions returns 400 with an example", async () => {
  const res = await handler(new Request(`${PUBLIC_URL}${e.path}`));
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.ok(body.error);
  assert.equal(body.disclaimer, API_DISCLAIMER);
  assert.ok(body.example);
});

test("bad line / unknown place / bad payment return 400", async () => {
  for (const q of ["totalCm=150&line=maglev", "totalCm=150&from=tokyo&to=atlantis", "totalCm=150&payment=bitcoin"]) {
    const res = await handler(new Request(`${PUBLIC_URL}${e.path}?${q}`));
    assert.equal(res.status, 400, q);
  }
});

test("OPTIONS preflight is CORS open", () => {
  const res = preflight();
  assert.equal(res.status, 204);
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
});

test("OpenAPI spec lists /api/check with GET and POST", () => {
  const spec = openapiDoc(API_INFO, PUBLIC_URL, [e]) as { paths: Record<string, { get: unknown; post: unknown }> };
  assert.ok(spec.paths["/api/check"]?.get);
  assert.ok(spec.paths["/api/check"]?.post);
});
