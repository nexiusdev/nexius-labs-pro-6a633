# Website VPS Admin + Customer UI TODO (PRD)

Source PRD: `/opt/openclaw-mvp/runbooks/WEBSITE_VPS_ADMIN_CUSTOMER_UI_IMPLEMENTATION_PRD.md`
Target repo: `/root/nexius-labs-pro-6a633`

## Ordered Plan
- [x] Phase A: RBAC foundation and role mapping helpers.
- [x] Phase A: API-level role checks for admin/customer modules.
- [x] Phase A: Shared redaction utility for UI/log payloads.
- [x] Phase B: Admin dashboard summary API + page (`/admin/dashboard`).
- [x] Phase B: Payments list/detail APIs + pages (`/admin/payments`, `/admin/payments/:paymentId`) with actions (`reprocess`, `relink`, `mark_duplicate`).
- [x] Phase B: Clients list/detail APIs + pages (`/admin/clients`, `/admin/clients/:clientId`).
- [x] Phase B: Jobs list/detail APIs + pages (`/admin/jobs`, `/admin/jobs/:jobId`) with stage timeline + retry/export.
- [x] Phase B: Entitlements API + page (`/admin/entitlements`) with add/revoke actions.
- [x] Phase B: VPS visibility page (`/admin/vps`) exposing assignment/provision mode view from job data.
- [x] Phase B: Audit API + page (`/admin/audit`).
- [x] Phase C: Expand `/api/fulfillment/install` payload with package lifecycle summaries and status mapping.
- [x] Phase C: Portal APIs (`/api/portal/workspace`, `/api/portal/packages`, `/api/portal/history`).
- [x] Phase C: Context + agent settings APIs with validation + audit records (`/api/portal/context`, `/api/portal/agent`).
- [x] Phase C: Customer pages (`/portal/workspace`, `/portal/packages`, `/portal/context`, `/portal/agent`, `/portal/onboarding`, `/portal/history`, `/portal/billing`).
- [x] Phase D: Add persistent portal audit table for context/agent changes.
- [x] Validation: targeted lint + build on touched modules.

## Notes
- Existing fulfillment queue/package actions were reused and kept integrated.
- Customer/portal and admin payloads apply redaction to sensitive fields before response.
