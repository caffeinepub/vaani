# Specification

## Summary
**Goal:** Redeploy the existing VAANI project to produce a publicly accessible testing build and verify it passes the deployment verification checklist.

**Planned changes:**
- Redeploy the current VAANI project (no new project/canister) to create a new public testing build, retrying if a deployment attempt errors.
- Verify the live deployment against `frontend/DEPLOYMENT_VERIFICATION.md` (unauthenticated load, login, authenticated navigation, logout, idle timeout, logo rendering, and console checks).
- Confirm no provider-related console errors and no broken/404 logo asset requests in the live build.

**User-visible outcome:** A reachable VAANI testing build in the browser that loads, supports login/logout and authenticated navigation, enforces idle timeout, displays the header logo correctly, and shows no relevant console/provider errors.
