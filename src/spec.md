# Specification

## Summary
**Goal:** Fix the blank/white screen crash by ensuring TanStack Router context is available before any component (including `Header`) calls TanStack Router hooks.

**Planned changes:**
- Update `frontend/src/main.tsx` to mount the app under TanStack `RouterProvider` using the existing router/route tree so router context exists before routed components render.
- Update `frontend/src/components/Header.tsx` so it does not unconditionally call `useRouterState()` / `useNavigate()` when router context is not available (or ensure `Header` only renders within the `RouterProvider` tree).
- Produce a new deployment build after applying the fix and verify initial load/refresh no longer results in a blank/white screen and the router store crash is gone.

**User-visible outcome:** The app loads and renders normally on first load/refresh (no blank/white screen), and navigation between `/` and `/studio` works without router-context crashes.
