# Specification

## Summary
**Goal:** Add a backend-only audio metadata submission and admin approval workflow (metadata only, no audio files).

**Planned changes:**
- Define a public Motoko Audio Metadata type in `backend/main.mo` with fields: `id`, `ownerPrincipal`, `uploadedFrom` (`#Studio` | `#CreatorZone`), `duration`, `isApproved`, `isPremium`.
- Add an authenticated Creator Zone submission method that creates pending audio metadata (sets `ownerPrincipal = caller`, `uploadedFrom = #CreatorZone`, `isApproved = false`) and stores it separately from approved/public items.
- Add admin-only backend methods to list pending submissions and to approve or reject a pending submission by id.
- Add a public read API that returns only approved audio metadata.
- Enforce access rules: only admins can approve/reject; public reads never include pending/unapproved items; prevent self-approval when `caller == ownerPrincipal`.

**User-visible outcome:** Creators can submit audio metadata for review; admins can review and approve/reject submissions; everyone else can only read approved audio metadata.
