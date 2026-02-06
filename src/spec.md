# Specification

## Summary
**Goal:** Fix logout blank-screen behavior with a root soft-redirect, and add an admin-only post-login redirect to Studio without changing the routing structure.

**Planned changes:**
- Update AuthContext logout flow (manual logout and idle auto-logout) to clear session state and React Query cache, then soft-redirect to `/` via `navigate('/', { replace: true })` (no hard reload; do not use `/creator-zone`).
- Update the login success handler so that only after an app-initiated successful login: admins soft-redirect to `/studio` via `navigate('/studio', { replace: true })`; non-admins do not trigger navigation.
- Keep existing routes, router setup, layouts, Header, and Studio guards unchanged; apply only the scoped redirect logic changes in source files.

**User-visible outcome:** After logout (manual or idle), users reliably return to the app root (`/`) without a blank screen; after logging in, admins are taken directly to `/studio` while non-admin users remain on `/`.
