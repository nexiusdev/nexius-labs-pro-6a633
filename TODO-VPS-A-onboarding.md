# VPS A Onboarding Todo

## Phase 1: Foundation
- Add Supabase tables for:
  - `customer_entitlements`
  - `telegram_bot_pool`
  - `customer_bot_assignments`
  - `onboarding_jobs`
- Lock down new sensitive tables with RLS
- Add onboarding helper library for:
  - `customer_id` generation
  - `Idempotency-Key` generation
  - `X-Request-Id` generation
  - Telegram user ID validation

Status:
- complete

## Phase 2: Replace Old Customer Bot Token Flow
- Remove customer bot token field from website onboarding form
- Replace old `/api/onboarding/telegram` behavior with job creation flow
- Deprecate `payment_onboarding` for new writes

Status:
- complete

## Phase 3: Purchase to Entitlement
- Create entitlement records from active subscription role IDs
- Ensure onboarding only proceeds for authenticated user with valid subscription

Status:
- complete for initial flow

## Phase 4: Orchestration
- Add internal bot assignment service using `telegram_bot_pool`
- Add VPS A -> VPS B onboarding client
- Persist onboarding job state transitions

Status:
- complete for initial synchronous dispatch

## Phase 5: UI
- Show onboarding form after subscription becomes active
- Show onboarding job state and result in payment success flow

Status:
- complete for current flow

## Phase 6: Hardening
- Add retry handling using stored idempotency keys
- Add operator audit fields
- Add reconciliation for subscriptions vs entitlements vs onboarding jobs

Status:
- complete

## Remaining Operational Work
- Apply new Supabase migrations in target environment
- Seed `telegram_bot_pool` with real bot inventory
- Set `VPS_B_ONBOARDING_URL`
- Set `VPS_B_ONBOARDING_TOKEN`
- Validate against real VPS B endpoint

## Operator Tooling
- `npm run seed:telegram-bot-pool -- <json-file>`
- `npm run reconcile:vps-a-onboarding`
- `npm run reconcile:vps-a-onboarding -- --apply`
