# Login

**Purpose:** Authenticate a user by email/password and issue a JWT carrying their role and branch.
**Trigger:** HTTP — `POST /acme-ev/auth/login`
**Entry point:** `backend/src/auth/controllers/auth.controller.ts::login` → `LoginHandler`
**Capability:** Identity & Access
**Owner:** Backend Team
**Criticality:** Critical

## Dependencies
- Services: none beyond the datastore
- Queues/Topics: none
- Databases: PostgreSQL `users` (read)

## Related Flows
- Every authenticated flow depends on the JWT this flow issues — e.g. [Query GPS Events](../query-gps-events/), [Query Status Events](../query-status-events/), [List Vehicles](../list-vehicles/).

## Related Decisions
- [ADR-0005 Stateless JWT auth with role-based data scoping](../../adrs/0005-jwt-rbac-data-scoping.md)
- [ADR-0006 CQRS structure in the backend](../../adrs/0006-cqrs-backend.md)

## Operational Notes
Critical — an auth outage blocks every other endpoint. It depends only on PostgreSQL being reachable. Watch `api.5xx` for the `/auth/login` route. General metrics/runbooks: [`observability.md`](../../observability.md), [`operations-guide.md`](../../operations-guide.md).

## Navigation
[Sequence](sequence.md) · [Components](components.md) · [Contracts](contracts.md)

## Traceability
- Project brief — confidentiality / role-based access control; see [`references.md`](../../references.md).
