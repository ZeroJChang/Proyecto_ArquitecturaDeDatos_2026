# List Users

**Status:** Validated
**Purpose:** List users with search, role filter, and sorting, for administrators.
**Boundary:** Admin read of the user registry with search, role filter, and sorting; no writes.
**Why grouped:** A single trigger with one outcome, owner, and failure model.
**Included triggers:** `GET /acme-ev/users`
**Entry point:** `backend/src/users/controllers/users.controller.ts::getUsers` → `GetUsersHandler`
**Capability:** Fleet Administration
**Owner:** Backend Team
**Criticality:** Low

## Dependencies
- Services: none beyond the datastore
- Queues/Topics: none
- Databases: PostgreSQL `users` (read)

## Canonical Knowledge
- Domain: [Fleet Administration](../../knowledge/domain.md#fleet-administration)
- Contracts: [EV Fleet REST API](../../knowledge/contracts.md#ev-fleet-rest-api)
- Entities: [users](../../knowledge/database.md#users)
- Security: [Sensitive data](../../security.md#sensitive-data) — the password hash is never returned

## Related Flows
- [Login](../login/index.md) — authenticates the users listed here
- [View Dashboards](../view-dashboards/index.md) — admin dashboard reports the user count

## Related Decisions
- [ADR-0005 Stateless JWT auth with role-based data scoping](../../history/adrs/0005-jwt-rbac-data-scoping.md)
- [ADR-0006 CQRS structure in the backend](../../history/adrs/0006-cqrs-backend.md)

## Operational Notes
Admin-only, low-traffic listing. Responses must never include password hashes. General metrics/runbooks: [Observability](../../operations/observability.md).

## Reading Path
1. **Overview** — this file.
2. [Sequence](sequence.md).
3. [Components](components.md).
4. [Persistence Context](persistence.md).
5. [Contract Usage](contract-usage.md).

## Traceability
- Administrative user management; see [References](../../knowledge/references.md).
