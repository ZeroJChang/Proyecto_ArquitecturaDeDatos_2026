# ADR-0005: Stateless JWT auth with role-based data scoping

**Status:** Accepted
**Date:** 2026-06-15
**Scope:** System
**Related Flows:** Login, Query GPS Events, Query Status Events, List Vehicles

## Context

The requirements demand confidentiality: an owner may see only their own vehicles, a branch operator only their branch, and an admin everything. The backend is stateless and may be replicated, so the auth mechanism must not rely on server-side session state.

## Decision

Use **stateless, HMAC-signed JWTs** issued at [Login](../flows/login/) carrying claims `{ sub, email, role, branchId }`. Authorization is enforced in two layers: `@Roles(...)` + `RolesGuard` gate endpoints by role, and each query handler applies **data scoping** — branch operators are filtered to their `branchId`, owners to vehicles linked in `vehicle_owners`.

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| Stateless JWT + per-handler scoping — **chosen** | No session store; scales horizontally; claims carry role + branch for scoping | Tokens valid until expiry (no easy revocation); scoping logic must be applied consistently in every handler |
| Server-side sessions | Easy revocation; opaque tokens | Requires shared session store; complicates horizontal scaling of a stateless API |
| Role gating only (no data scoping) | Simpler handlers | Fails the confidentiality requirement — a branch user could read other branches' data |

## Trade-offs

We gain a stateless, horizontally scalable auth model whose claims directly power data scoping. We give up easy token revocation and accept that every data-returning handler must apply the correct scope — a discipline, not an automatic guarantee.

## Consequences

- All `/acme-ev/*` routes except login require a valid JWT.
- Scoping bugs are confidentiality bugs; handlers like [Query GPS Events](../flows/query-gps-events/) and [Query Status Events](../flows/query-status-events/) verify ownership/branch before returning data.
- Passwords are stored as bcrypt hashes; tokens expire per `JWT_EXPIRES_IN`.

## Future Considerations

If revocation becomes necessary (e.g. compromised token), introduce short-lived access tokens with refresh tokens, or a token denylist. Consider centralizing scoping in a shared guard/interceptor to reduce per-handler repetition.
