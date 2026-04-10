# ADMIN SEPARATE LOGIN PRD

## Document Control
- Owner: Nexius Labs Website Team
- Systems: Website VPS (`agent.nexiuslabs.com`), Supabase
- Date: 2026-04-10
- Status: Draft for implementation

## 1. Problem Statement
The current admin access model is operationally awkward:
- Admins sign in through the same auth flow as customers.
- Admin authorization is controlled by `FULFILLMENT_ADMIN_USER_IDS` in environment config.
- Granting or revoking admin access requires knowing a Supabase user id and redeploying or restarting the app.

This makes admin access harder to understand for operators and harder to manage for non-technical staff.

## 2. Objective
Introduce a simple, separate admin login experience based on a dedicated route and admin credentials, without changing customer portal authentication.

Target model:
- Customers continue using the current Supabase-based login for `/portal/*`.
- Admins use `/admin/login`.
- Successful admin login creates a secure admin session cookie.
- All `/admin/*` pages and `/api/admin/*` endpoints use the admin session, not the customer allowlist.

## 3. Non-Goals
- Replacing customer auth or portal auth.
- Replacing Supabase as the application data store.
- Building a full enterprise IAM product.
- Supporting SSO in this phase.
- Removing the ability to add stronger auth later, such as 2FA or SSO.

## 4. Current State Summary (Verified)
Website repo already contains:
- Admin UI routes under `/admin/*`.
- Admin APIs under `/api/admin/*`.
- Current admin gating via app-side RBAC and env allowlist.
- Shared auth path with customer login.

Current problems:
- No dedicated admin login page.
- No admin-specific session concept.
- No database-backed admin account management.

## 5. Product Requirements

### 5.1 Separate Admin Entry Point
- Add `/admin/login` page with:
  - username
  - password
  - login button
  - invalid credential error state
- Add `/admin/logout` action or button.

### 5.2 Dedicated Admin Session
- Successful admin login must create a secure `HttpOnly` cookie.
- Admin cookie must be independent from portal/customer session state.
- Admin session expiration must be enforced.
- Logout must invalidate the admin session.

### 5.3 Admin Surface Protection
- All `/admin/*` pages must require a valid admin session.
- All `/api/admin/*` endpoints must require a valid admin session.
- Unauthenticated admin access must redirect to `/admin/login` for pages and return `401` for APIs.

### 5.4 Simple Administration
- Admin accounts must be manageable without editing `FULFILLMENT_ADMIN_USER_IDS`.
- Admin access should be grantable and revocable through database records.
- Passwords must be stored hashed, never plaintext.

### 5.5 Auditability
- Record admin auth events:
  - login success
  - login failure
  - logout
  - password reset or password change
  - account disable
- Store timestamp, username, IP, and user agent where practical.

## 6. Architecture

### 6.1 High-Level Model
Two parallel auth systems will coexist:
- Customer auth:
  - Supabase auth
  - protects `/portal/*`, account routes, billing flows
- Admin auth:
  - custom username/password login
  - secure cookie-backed admin sessions
  - protects `/admin/*` and `/api/admin/*`

This keeps customer and admin access separated and avoids coupling admin access to customer identities.

### 6.2 Proposed Data Model
Add database tables in schema `nexius_os`:

- `admin_users`
  - `id uuid primary key`
  - `username text unique not null`
  - `password_hash text not null`
  - `status text not null default 'active'`
  - `role text not null default 'admin'`
  - `last_login_at timestamptz`
  - `created_at timestamptz`
  - `updated_at timestamptz`
  - `created_by text`
  - `updated_by text`

- `admin_sessions`
  - `id uuid primary key`
  - `admin_user_id uuid references admin_users(id)`
  - `session_token_hash text not null`
  - `expires_at timestamptz not null`
  - `revoked_at timestamptz`
  - `created_at timestamptz`
  - `last_seen_at timestamptz`
  - `ip_address text`
  - `user_agent text`

- `admin_auth_audit`
  - `id uuid primary key`
  - `admin_user_id uuid null`
  - `username text`
  - `event_type text not null`
  - `success boolean not null`
  - `ip_address text`
  - `user_agent text`
  - `metadata jsonb not null default '{}'::jsonb`
  - `created_at timestamptz`

### 6.3 Session Design
- Login endpoint validates username/password against `admin_users`.
- Passwords are verified using a modern password hash function such as `bcrypt` or `argon2`.
- Server generates a random session token.
- Only the token hash is stored in `admin_sessions`.
- Raw token is stored in a secure cookie:
  - `HttpOnly`
  - `Secure`
  - `SameSite=Lax`
  - path limited to `/admin` if practical

### 6.4 Route Protection Design
- Admin pages:
  - middleware or server-side guard checks admin cookie
  - if missing/invalid, redirect to `/admin/login`
- Admin APIs:
  - shared `requireAdminSession()` helper validates cookie
  - invalid session returns `401`

### 6.5 Backward Compatibility
- Existing `FULFILLMENT_ADMIN_USER_IDS` allowlist should be supported only during migration.
- Final target is DB-backed admin auth as the single admin access model.

## 7. API and Route Scope

### 7.1 New Routes
- `GET /admin/login`
- `POST /api/admin/auth/login`
- `POST /api/admin/auth/logout`
- Optional:
  - `GET /api/admin/auth/session`
  - `POST /api/admin/auth/change-password`

### 7.2 Existing Routes to Update
- `/admin/*`
  - replace allowlist-only guard with admin session guard
- `/api/admin/*`
  - replace user-id allowlist check with admin session validation

## 8. Security Requirements
- Password hashes only, never plaintext passwords.
- Constant-time comparisons where appropriate.
- Session tokens must be random and high entropy.
- Admin login must be rate limited.
- Repeated failed attempts should be logged.
- Disabled admin accounts must not authenticate.
- Cookie secret and auth secrets must be environment-configured.
- Session expiry should default to a bounded TTL, for example 8 to 24 hours.
- Sensitive auth events must be auditable.

## 9. UX Requirements
- `/admin/login` must be distinct from customer auth pages.
- Clear message on invalid credentials.
- Clear message on expired session.
- Logged-in admins should see an obvious logout action.
- Optional later enhancement:
  - separate admin landing page after login, such as `/admin/dashboard`

## 10. Implementation Plan

### Phase A: Data Foundation
1. Add migration for:
   - `admin_users`
   - `admin_sessions`
   - `admin_auth_audit`
2. Add service-only RLS policies if these tables live in `nexius_os`.
3. Seed one initial admin account through secure operational process.

### Phase B: Auth Backend
1. Implement password hashing and verification utilities.
2. Implement session token generation and hashing.
3. Add login/logout endpoints.
4. Add shared admin session validation helper.
5. Add audit event writer for auth events.

### Phase C: Admin UI Integration
1. Build `/admin/login`.
2. Protect `/admin/*` pages with admin session checks.
3. Protect `/api/admin/*` routes with admin session checks.
4. Add logout control in admin shell.

### Phase D: Migration and Cutover
1. Keep current allowlist as temporary fallback behind a feature flag if needed.
2. Verify admin login works end to end.
3. Disable env allowlist as primary auth path.
4. Remove obsolete allowlist-only guard logic after verification window.

## 11. Acceptance Criteria
1. Admin can open `/admin/login`, enter valid credentials, and access `/admin/dashboard`.
2. Invalid credentials do not grant access and are logged.
3. Admin cookie protects both page routes and admin API routes.
4. Logging out invalidates admin access immediately.
5. Customer login flow and `/portal/*` behavior remain unchanged.
6. Admin access can be granted or revoked through DB records without redeploying the website.
7. No plaintext admin password is stored in code, env, logs, or database.

## 12. Rollout Strategy
- Step 1: Deploy DB migration and backend session utilities.
- Step 2: Seed initial admin account.
- Step 3: Deploy `/admin/login` and session-guarded admin routes.
- Step 4: Validate admin UI access with seeded account.
- Step 5: Move production admin usage to new login path.
- Step 6: Retire `FULFILLMENT_ADMIN_USER_IDS` as the primary admin model.

## 13. Rollback Plan
- Re-enable current allowlist-based admin checks.
- Disable `/admin/login` entry point if needed.
- Revoke new admin sessions if a security or auth bug is found.
- Keep admin tables in place; rollback affects routing and auth enforcement, not customer data.

## 14. Risks
- Running two auth systems increases maintenance burden.
- Poor session handling would create a security vulnerability.
- Lack of rate limiting would expose brute-force risk.
- Incomplete cutover could cause mixed auth behavior across `/admin/*` routes.

## 15. Open Questions
- Should admin accounts support multiple roles such as `ops_admin`, `billing_admin`, `support_admin`?
- Should password reset be self-service or ops-only?
- Is 2FA required in phase one or phase two?
- Should admin auth remain fully separate from Supabase users long term, or eventually link to an internal identity table?

## 16. Recommended Decision
Implement DB-backed admin login with hashed passwords and secure cookie sessions.

Do not implement a plaintext env-only username/password system except as a temporary bootstrap mechanism for the first admin account.
