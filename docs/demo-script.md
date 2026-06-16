# Demo script (60 seconds) — for reviewers

**What you're looking at:** ExampleHR time-off UI. Payroll system (HCM) owns balances; this frontend stays honest when HCM is slow, wrong, or changes data mid-session.

## Commands

```bash
pnpm install && pnpm dev
# separate terminal:
pnpm storybook
```

## Script

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open `/login` → Alex Rivera | Employee dashboard |
| 2 | Observe balance cards | "Verified Xs ago" on each location |
| 3 | Home `/` → HCM Simulator → **Anniversary bonus** | Toast/message: +1 day |
| 4 | `/employee` | Info banner: balance updated (+1 day Austin) |
| 5 | Submit 2-day request (Austin, future dates) | "Confirming with payroll" — not "Approved" |
| 6 | Log out → Morgan Lee → `/manager` | Pending queue |
| 7 | Select request → **Approve** | Verifies balance with HCM first |
| 8 | Storybook → `Dev/HcmChaosHarness` | Click triggers live mock behaviors |

## Three non-negotiable scenarios (tests)

1. **Insufficient balance** — `tests/integration/submit-reject.test.ts`
2. **Anniversary mid-session** — `tests/integration/anniversary.test.ts`
3. **Silent wrong success** — `tests/integration/silent-wrong.test.ts`

## Where mock HCM lives

- Runtime: `src/app/api/hcm/*` → `src/hcm-mock/handlers` — **`pnpm dev`** then `http://localhost:3000/api/hcm/...`
- Storybook/tests: MSW in `src/hcm-mock/msw-handlers.ts` (same engine)
- OpenAPI: `openapi/hcm.yaml` — in **Swagger Preview**, pick server **localhost:3000** (not the preview’s own port)

## Trigger chaos manually

```bash
curl -X POST http://localhost:3000/api/hcm/dev/chaos \
  -H 'Content-Type: application/json' \
  -d '{"action":"anniversary_bonus","employeeId":"emp-alex","locationId":"loc-austin"}'
```
