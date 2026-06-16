# ExampleHR Time-Off Frontend

Payroll (HCM) owns the numbers; this UI stays fast and honest when payroll is slow, wrong, or changes mid-session.

**Repo:** https://github.com/JorgeSarricolea/examplehr-time-off  
**Live app:** https://examplehrtimeoffnative.vercel.app  
**Storybook:** https://examplehr-time-off-storybook.vercel.app

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm storybook    # http://localhost:6006
pnpm test         # 38 tests
pnpm test:e2e     # 3 tests (smoke + demo flow)
```

Mock login: `alex@example.com` (employee), `morgan@example.com` (manager) — full list in [TRD §14](docs/TRD.md#14-demo-users-mock-login).

### Vercel live demo (maintainer)

The deployed app uses **shared Redis** for mock HCM state so submit → list → withdraw work across serverless instances. Local dev does not need Redis.

1. Vercel project → **Integrations** → add **Upstash Redis** (or Redis from Marketplace).
2. Environment variable: `HCM_MOCK_STORE=kv` (Production + Preview).
3. Redeploy. Upstash sets `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` automatically.

Without step 2, the live URL may show empty lists or withdraw 404 — use `pnpm dev` for the full harness. Chaos panel and random silent-wrong are **disabled in production**.

## Reviewer path

| Goal | Start here |
|------|------------|
| See it work (60s) | [docs/demo-script.md](docs/demo-script.md) → live [app](https://examplehrtimeoffnative.vercel.app) |
| Engineering spec + E01–E14 proof | [docs/TRD.md](docs/TRD.md) |
| HCM API contract | [openapi/hcm.yaml](openapi/hcm.yaml) |
| UI state matrix | [Storybook](https://examplehr-time-off-storybook.vercel.app) |
