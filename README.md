# ExampleHR Time-Off Frontend

Payroll (HCM) owns the numbers; this UI stays fast and honest when payroll is slow, wrong, or changes mid-session.

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm storybook    # http://localhost:6006
pnpm test         # 38 tests
pnpm test:e2e     # 3 tests (smoke + demo flow)
```

Mock login: `alex@example.com` (employee), `morgan@example.com` (manager) — full list in [TRD §14](docs/TRD.md#14-demo-users-mock-login).

## Reviewer path

| Goal | Start here |
|------|------------|
| See it work (60s) | [docs/demo-script.md](docs/demo-script.md) |
| Engineering spec + E01–E14 proof | [docs/TRD.md](docs/TRD.md) |
| HCM API contract | [openapi/hcm.yaml](openapi/hcm.yaml) |

Deploy: [`vercel.json`](vercel.json) (app) · [`vercel.storybook.json`](vercel.storybook.json) (Storybook) — details in [TRD §13](docs/TRD.md#13-deployment).
