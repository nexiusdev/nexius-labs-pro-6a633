# Website Portal-Only Consolidation TODO

Source PRD: `/root/nexius-labs-pro-6a633/runbooks/WEBSITE_PORTAL_ONLY_CONSOLIDATION_PRD.md`
Target repo: `/root/nexius-labs-pro-6a633`

## Phase A: Routing and UI Consolidation
- [x] Replace global `Subscriptions` nav entry with `Portal` route (`/portal/workspace`).
- [x] Redirect `/account/subscriptions` to `/portal/billing`.
- [x] Convert `/payment/success` to compatibility redirect into `/portal/onboarding`.
- [x] Update checkout success URL to `/portal/onboarding?subscription=<id>`.
- [x] Ensure auth next-paths in touched subscription/onboarding surfaces point to portal routes.

## Phase B: Data Contract Unification
- [x] Use canonical lifecycle/data path for portal onboarding status.
- [x] Support `subscription` query targeting in portal onboarding flow.
- [x] Keep `/portal/billing` on canonical subscription API and remove legacy page dependency from user-visible flow.

## Phase C: Ops and Release Hardening
- [x] Add rollout/rollback operational notes for portal-only cutover.
- [x] Include verification checklist for redirects + worker/control reachability.

## Validation
- [x] Targeted lint on changed files passes.
- [x] Build passes with required env vars.
- [x] Mark all checklist items complete.
