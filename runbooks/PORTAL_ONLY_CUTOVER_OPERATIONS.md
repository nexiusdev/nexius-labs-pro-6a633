# Portal-Only Cutover Operations

## Purpose
Operational checklist for moving customer flows from legacy `/account/subscriptions` to portal-only surfaces.

## Rollout Steps
1. Deploy website build containing:
- `/account/subscriptions` redirect to `/portal/billing`
- `/payment/success` compatibility redirect to `/portal/onboarding`
- navigation entry change from `Subscriptions` to `Portal`
2. Keep redirect behavior temporary during canary window.
3. Validate checkout returns to portal onboarding with `subscription` query.
4. Monitor onboarding throughput and portal API errors for at least one observation window.
5. After stability, switch to permanent redirect policy if desired.

## Required Runtime Dependencies
- Website VPS fulfillment worker remains active:
  - `npm run worker:fulfillment:loop`
- Website env includes valid control-plane integration vars:
  - `NEXIUS_CONTROL_ONBOARDING_URL` or `NEXIUS_CONTROL_BASE_URL`
  - `NEXIUS_CONTROL_ONBOARDING_TOKEN`
  - `NEXIUS_CONTROL_ONBOARDING_TIMEOUT_MS`

## Cross-VPS Contract Verification
Validate OpenClaw control endpoints from Website VPS:
- `POST /v1/tenants/onboard`
- `POST /v1/tenants/onboard/packages/retry`
- `POST /v1/tenants/onboard/packages/rollback`

Validate strict error semantics still returned:
- `TENANT_ASSIGNMENT_NOT_FOUND`
- `TENANT_ALREADY_ASSIGNED`

## Validation Checklist
- Route behavior:
  - `/account/subscriptions` resolves to `/portal/billing`
  - `/payment/success?subscription=<id>` resolves to `/portal/onboarding?subscription=<id>`
- Portal behavior:
  - `/portal/workspace` status and `/portal/packages` status agree on lifecycle mapping
  - `/portal/onboarding` loads the requested subscription when query param is supplied
- Worker behavior:
  - queued jobs are processed and state transitions continue (`payment_confirmed -> package_resolved -> tenant_request_sent -> in_progress/completed`)

## Rollback
1. Restore legacy nav entry and disable redirect-forward behavior.
2. Keep portal APIs and schema unchanged.
3. Confirm customer can still access billing and onboarding from prior routes.
