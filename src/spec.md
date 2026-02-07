# Specification

## Summary
**Goal:** Fix the React provider hierarchy so `useAuth()` is always executed within an active `AuthProvider`, preventing blank/white screens and runtime crashes during route renders.

**Planned changes:**
- Refactor the auth provider setup so the exported/used `AuthProvider` wraps the entire app/router tree and is mounted above `InternetIdentityProvider`, while still allowing AuthContext to consume Internet Identity state internally (without changing `useInternetIdentity`).
- Update the application root composition (`frontend/src/main.tsx` or its entry component) so `RouterProvider`, `Header`, `CreatorZoneTab`, and all routes render inside the `AuthProvider` boundary.
- Validate that existing auth behaviors remain intact after the hierarchy change: login, logout, admin redirect to `/studio`, query-cache clearing on logout, and 5-minute idle timeout auto-logout banner behavior in Creator Zone.
- Apply changes only to source TS/TSX files under `frontend/src/**` (no compiled/generated artifact edits) and redeploy, verifying via `frontend/DEPLOYMENT_VERIFICATION.md`.

**User-visible outcome:** The app loads reliably (including when unauthenticated) without blank screens; `Header` and `CreatorZoneTab` render safely on every route; login/logout flows, admin redirect, cache clearing, and idle timeout behavior work as before with no `useAuth must be used within AuthProvider` errors.
