# TODO: Separate Admin Login

## Foundation
- [ ] Apply migration for `admin_users`, `admin_sessions`, and `admin_auth_audit`.
- [ ] Set admin auth env as needed:
  - [ ] `ADMIN_SESSION_TTL_HOURS`
- [ ] Create initial admin user with the bootstrap script.

## Backend
- [x] Add password hashing and verification helpers.
- [x] Add admin session cookie issuance and revocation helpers.
- [x] Add admin auth audit logging.
- [x] Add `POST /api/admin/auth/login`.
- [x] Add `POST /api/admin/auth/logout`.
- [x] Add `GET /api/admin/auth/session`.
- [x] Add DB-backed admin session support to admin RBAC.

## UI
- [x] Add `/admin/login`.
- [x] Add admin-only guard path that uses admin session.
- [x] Add logout action to admin shell.
- [ ] Add clearer unauthorized/expired-session copy if needed.

## Admin Surface Cutover
- [x] Update `/api/admin/*` routes to accept admin session auth.
- [ ] Remove legacy allowlist fallback after verification window.

## Ops
- [x] Add bootstrap script to create or update an admin user.
- [ ] Document exact production steps to seed first admin account.
- [ ] Redeploy website after merge.

## Validation
- [ ] Login with seeded admin credentials at `/admin/login`.
- [ ] Confirm `/admin/dashboard` loads with cookie-only auth.
- [ ] Confirm `/api/admin/*` returns `401` after logout.
- [ ] Confirm customer `/portal/*` auth remains unchanged.
