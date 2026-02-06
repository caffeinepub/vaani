# Specification

## Summary
**Goal:** Eliminate the `useAuth must be used within AuthProvider` crash by restructuring the React provider tree so `AuthProvider` always wraps the entire routed app (including `CreatorZoneTab`), and redeploy the fix.

**Planned changes:**
- Update `frontend/src/main.tsx` so the app is rendered via TanStack Router’s `RouterProvider` using the existing `router`/`routeTree`, with `AuthProvider` mounted at the absolute top of the React tree.
- Ensure `AuthProvider` unconditionally wraps `RouterProvider` (no conditional provider mounting) so all routes/components are always descendants of `AuthProvider`.
- Audit the frontend route/layout/component tree and remove any duplicate or nested `AuthProvider` usages so there is exactly one top-level instance.
- Produce and deploy a new version after the provider-order fix and verify the login/logout flow no longer triggers the crash or blank screen in the deployed environment.

**User-visible outcome:** Users can load the app and perform login/logout transitions without a blank/white screen, and without the console error `Uncaught Error: useAuth must be used within AuthProvider` (including when `CreatorZoneTab` renders).
