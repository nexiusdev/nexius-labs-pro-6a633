# Website VPS Payment -> VPS Install TODO (PRD V2)

Source PRD: `/opt/openclaw-mvp/runbooks/WEBSITE_VPS_PAYMENT_TO_VPS_INSTALL_PRD.md`
Target repo: `/root/nexius-labs-pro-6a633`

## 0. Schema and Code-Path Audit (Required Before Migration)

### Reuse Decisions
- `nexius_os.subscriptions`: reuse and extend.
  - Why: already stores provider IDs, status, role IDs, billing context.
  - Delta: immutable purchase snapshot fields and v2 contract markers.
- `nexius_os.customer_entitlements`: reuse as source of truth for active role access.
  - Delta: persist package and contract snapshot metadata.
- `nexius_os.onboarding_jobs`: reuse and extend for fulfillment lifecycle.
  - Why: existing idempotency + per-subscription tracking already present.
  - Delta: v2 state machine, request/response payload snapshots, retries, correlation fields.
- `nexius_os.subscription_events`: keep for subscription audit, but do not use as sole webhook ledger.
  - Why not enough: it requires `subscription_id` and lacks processing status/replay semantics.

### New Objects Required
- `nexius_os.sku_registry`: versioned `sku_code -> package_id -> role_ids -> package_version` map.
- `nexius_os.payment_events`: durable webhook ledger + dedupe + processing status.
- `nexius_os.onboarding_job_events`: append-only fulfillment audit trail.
- `nexius_os.customer_tenant_mappings`: explicit tenant assignment lookup for `provisionMode`.

### ALTER vs CREATE Plan
- ALTER: `subscriptions`, `customer_entitlements`, `onboarding_jobs`.
- CREATE: `sku_registry`, `payment_events`, `onboarding_job_events`, `customer_tenant_mappings`.

### Backfill Plan
- Active subscriptions (`status='active'`) missing snapshot fields:
  - set `contract_version='v2'`
  - set `tenant_profile='runtime_plus_ui_supabase'`
  - synthesize `purchase_snapshot` from existing `role_ids` when missing.
- Existing active entitlements missing package metadata:
  - set fallback package metadata from synthesized snapshot.
- Existing onboarding jobs:
  - map legacy states (`queued` -> `payment_confirmed`) when no fulfillment state exists.

### Rollback Plan
- Non-destructive migration strategy:
  - only additive schema changes (new tables/columns/indexes).
  - no drops in this wave.
- App rollback:
  - revert code deployment; old columns/tables remain compatible.
- Data rollback:
  - disable new worker/dispatch route and stop enqueueing from webhook.

## 1. Ordered Implementation Tasks
- [x] Write this PRD TODO with audit decisions and rollout plan.
- [x] Add Supabase migration for V2 contract, payment ledger, fulfillment lifecycle, SKU registry, and tenant mapping.
- [x] Implement SKU/purchase snapshot resolution helpers.
- [x] Implement fulfillment orchestration library (state machine, dispatch payload, retries, job events, provision mode rule).
- [x] Refactor Airwallex webhook to use payment ledger idempotency + enqueue fulfillment job only.
- [x] Add DLQ/replay tooling for failed webhook processing.
- [x] Add worker entrypoints (internal API + script) to process queued fulfillment jobs.
- [x] Add admin queue/retry API and admin page with state/age/error filters.
- [x] Replace customer Telegram onboarding UI with customer fulfillment timeline + retry/recovery guidance.
- [x] Ensure strict control-plane error handling (`TENANT_ASSIGNMENT_NOT_FOUND`, `TENANT_ALREADY_ASSIGNED`).
- [x] Add reconciliation script for paid subscriptions missing entitlement/job.
- [x] Update docs/env examples and run lint/build verification (with env caveat).

## 2. Acceptance Checklist
- [x] Duplicate webhook events do not duplicate fulfillment/install.
- [x] Each active paid subscription has exactly one current entitlement snapshot.
- [x] `POST /v1/tenants/onboard` uses V2 payload + stable idempotency key.
- [x] Failed jobs are retryable from admin UI.
- [x] Customer status page shows fulfillment state transitions.
- [x] Strict mode errors handled explicitly.

## 3. Validation Notes
- Targeted lint over all touched files passes.
- Full-project `npm run lint` still reports pre-existing repo-wide lint errors outside this PRD delta.
- `npm run build` passes when required Supabase env variables are present in the shell.
- Added v2 naming-compatible API route alias:
  - `/api/fulfillment/install` (backward compatible with `/api/onboarding/telegram` implementation)
- Added continuous worker loop entrypoint for operations:
  - `scripts/fulfillment-worker-loop.ts`
  - `npm run worker:fulfillment:loop`

## 4. Package Lifecycle V1 Integration Notes
- Added admin package lifecycle action APIs:
  - `POST /api/admin/fulfillment/package-retry`
  - `POST /api/admin/fulfillment/package-rollback`
- Admin fulfillment queue now renders per-package lifecycle status and package-level retry/rollback actions.
- Customer onboarding status now renders package lifecycle details from control-plane response payload:
  - package `state/status`
  - package `stage`
  - package health summary
