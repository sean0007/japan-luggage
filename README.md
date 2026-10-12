# Japan Luggage Check

Free, unofficial checker for Japan travelers: **will my suitcase fit on the Shinkansen** (oversized-baggage rule by line) and **what does Yamato TA-Q-BIN luggage forwarding cost** (any prefecture pair or to an airport) at Yamato's current cash and cashless rates (revised 2025-10-01).

- Site: https://japan-luggage.vercel.app
- API: `GET/POST /api/check`, `GET /api/rules`, `/openapi.json`, `/llms.txt`, `/.well-known/ai-plugin.json`
- Share pages: `/r?l=75&w=50&h=30&kg=22&f=tokyo&t=kyoto&line=tokaido` with `/og` cards
- MCP: `japan_luggage_check` on https://free-agent-tools.vercel.app/mcp

Free, no key, CORS open. Educational estimate, not affiliated with Yamato, JR or any airport.

```
npm install
npm test
npm run dev
```

MIT licensed.
