# WEBSITE PORTAL-ONLY CONSOLIDATION PRD

## Document Control
- Owner: Nexius Labs Website Team
- Systems: Website VPS (`agent.nexiuslabs.com`), OpenClaw Control VPS
- Date: 2026-04-08
- Status: Draft for implementation

## 1. Problem Statement
The current user journey has overlapping account surfaces:
- `/account/subscriptions` (legacy subscriptions UI)
- `/portal/*` (new customer portal UI)

Both surfaces read related subscription/onboarding data, causing duplicated UX, routing ambiguity, and inconsistent status interpretation.

## 2. Objective
Consolidate customer post-purchase experience into `portal` as the canonical surface.

Target model:
- Subscription creation/checkout remains a billing action.
- All post-checkout status, onboarding lifecycle, package lifecycle, context, and agent settings live under `/portal/*`.
- Legacy subscription page is deprecated and redirected.

## 3. Non-Goals
- Rebuilding payment provider integration (Airwallex checkout flow stays).
- Re-architecting Supabase schema beyond migration-safe additions required by this PRD.
- Replacing OpenClaw control-plane provisioning APIs.

## 4. Current State Summary (Verified)
Website repo already contains:
- Portal pages and APIs: `/portal/workspace`, `/portal/packages`, `/portal/context`, `/portal/agent`, `/portal/onboarding`, `/portal/history`, `/portal/billing`.
- Legacy account subscriptions page: `/account/subscriptions`.
- Checkout success path currently points to `/payment/success?subscription=...`.
- Fulfillment worker loops on Website VPS and dispatches to Control VPS (`/v1/tenants/onboard`, package retry/rollback endpoints).

## 5. Product Requirements

### 5.1 Canonical Navigation
- Replace `Subscriptions` nav entry with `Portal`.
- Portal landing route: `/portal/workspace`.
- Keep `/portal/billing` as the place for billing/subscription visibility and actions.

### 5.2 Redirect Rules
- Redirect `/account/subscriptions` -> `/portal/billing` (HTTP 302 initially, upgrade to 301 after verification window).
- Redirect successful checkout return to `/portal/onboarding?subscription=<id>`.
- Keep `/payment/success` temporarily as compatibility route; it should redirect into portal.

### 5.3 Data Consistency
- Portal pages must use one canonical lifecycle mapping for onboarding/install status.
- Any billing summary shown in portal must use the same API contract as existing account subscription data.
- Remove duplicate status cards and duplicate action controls in legacy views.

### 5.4 Access & Security
- Preserve existing auth checks in all portal APIs.
- Preserve RBAC for admin surfaces; no role widening.
- Ensure sensitive payloads remain redacted in responses and audit logs.

## 6. Technical Scope by VPS

### 6.1 Website VPS (In Scope)
- Frontend route and navigation consolidation.
- Redirect handlers for legacy routes.
- API contract normalization for portal billing/onboarding reads.
- Fulfillment worker runtime unchanged but documented as required dependency for portal onboarding freshness.

### 6.2 OpenClaw Control VPS (In Scope)
- No new feature required if existing endpoints remain compatible.
- Must continue to provide:
  - `POST /v1/tenants/onboard`
  - `POST /v1/tenants/onboard/packages/retry`
  - `POST /v1/tenants/onboard/packages/rollback`
- Must preserve strict error codes consumed by website logic:
  - `TENANT_ASSIGNMENT_NOT_FOUND`
  - `TENANT_ALREADY_ASSIGNED`

### 6.3 Out of Scope (This PRD)
- Replacing control-plane contracts.
- Multi-tenant identity redesign.

## 7. Implementation Plan

### Phase A: Routing and UI Consolidation
1. Update global navigation to show `Portal` entry.
2. Add route-level redirect for `/account/subscriptions` -> `/portal/billing`.
3. Convert `/payment/success` to redirect-forward page into `/portal/onboarding`.
4. Ensure auth redirect preserves `next` destination under portal paths.

### Phase B: Data Contract Unification
1. Define and enforce single lifecycle status mapping used across:
   - `/portal/workspace`
   - `/portal/onboarding`
   - `/portal/packages`
2. Ensure `/portal/billing` consumes the canonical subscription API response and displays status without legacy-only assumptions.
3. Remove or hide duplicated subscription/onboarding components not used post-cutover.

### Phase C: Ops and Release Hardening
1. Verify fulfillment worker loop is active in production Website VPS.
2. Validate control-plane endpoint reachability and token configuration.
3. Add runbook notes for rollback toggles (disable redirects, restore legacy nav).

## 8. Acceptance Criteria
1. Logged-in user can complete purchase and lands in portal onboarding flow, not legacy subscription page.
2. `/account/subscriptions` no longer serves independent UI and forwards to portal billing.
3. Portal shows accurate status progression from payment to install completion using current onboarding job state.
4. No duplicated subscription status widgets remain in user-facing navigation flow.
5. Admin and portal RBAC behavior remains unchanged.
6. Fulfillment worker and control-plane integrations continue functioning without regression.

## 9. Rollout Strategy
- Step 1: Deploy code with redirects + portal nav changes behind optional feature flag.
- Step 2: Enable redirects for a canary window.
- Step 3: Monitor onboarding job throughput and portal error rates.
- Step 4: Switch redirect to permanent (301) after stable period.

## 10. Rollback Plan
- Re-enable legacy nav item and disable redirects.
- Keep portal endpoints untouched; rollback affects routing/UI only.
- No destructive DB rollback required.

## 11. Validation Checklist
- Route checks:
  - `/account/subscriptions` redirects to `/portal/billing`.
  - `/payment/success?subscription=<id>` resolves to `/portal/onboarding?subscription=<id>`.
- Data checks:
  - Portal billing and onboarding reflect latest subscription/job state.
- Ops checks:
  - Fulfillment worker loop running.
  - Control-plane onboarding endpoint reachable from Website VPS.

## 12. Dependencies
- Existing Supabase schema/migrations already applied, including:
  - `20260407181000_payment_to_vps_install_v2.sql`
  - `20260408093000_admin_customer_ui_phase1.sql`
- Valid website environment configuration for Supabase and Nexius control-plane variables.
