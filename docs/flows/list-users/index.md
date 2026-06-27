# List Users

**Purpose:** List users with search, role filter, and sorting, for administrators.
**Trigger:** HTTP — `GET /acme-ev/users`
**Entry point:** `backend/src/users/controllers/users.controller.ts::getUsers` → `GetUsersHandler`
**Capability:** Fleet Administration
**Owner:** Backend Team
**Criticality:** Low

## Dependencies
- Services: none beyond the datastore
- Queues/Topics: none
- Databases: PostgreSQL `users` (read)

## Related Flows
- [Login](../login/) — authenticates the users listed here
- [View Dashboards](../view-dashboards/) — admin dashboard reports the user count

## Related Decisions
- [ADR-0005 Stateless JWT auth with role-based data scoping](../../adrs/0005-jwt-rbac-data-scoping.md)
- [ADR-0006 CQRS structure in the backend](../../adrs/0006-cqrs-backend.md)

## Operational Notes
Admin-only, low-traffic listing. Responses must never include password hashes. General metrics/runbooks: [`observability.md`](../../observability.md).

## Navigation
[Sequence](sequence.md) · [Components](components.md) · [Contracts](contracts.md) · [Database](database.md)

## Traceability
- Administrative user management; see [`references.md`](../../references.md).
