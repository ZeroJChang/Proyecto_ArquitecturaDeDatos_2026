# Login

**Status:** Validated
**Purpose:** Authenticate a user by email/password and issue a JWT carrying their role and branch.
**Boundary:** From a credential submission to an issued token; downstream authorization is applied per-request by every other flow.
**Why grouped:** A single trigger with one outcome (token issuance), one owner, and one failure model.
**Included triggers:** `POST /acme-ev/auth/login`
**Entry point:** `backend/src/auth/controllers/auth.controller.ts::login` → `LoginHandler`
**Capability:** Identity & Access
**Owner:** Backend Team
**Criticality:** Critical

## Dependencies
- Services: none beyond the datastore
- Queues/Topics: none
- Databases: PostgreSQL `users` (read)

## Canonical Knowledge
- Domain: [Identity & Access](../../knowledge/domain.md#identity--access)
- Contracts: [EV Fleet REST API](../../knowledge/contracts.md#ev-fleet-rest-api)
- Entities: [users](../../knowledge/database.md#users)
- Security: [Authentication and Authorization](../../security.md#authentication-and-authorization)

## Related Flows
- Every authenticated flow depends on the JWT this flow issues — e.g. [Query GPS Events](../query-gps-events/index.md), [Query Status Events](../query-status-events/index.md), [List Vehicles](../list-vehicles/index.md).

## Related Decisions
- [ADR-0005 Stateless JWT auth with role-based data scoping](../../history/adrs/0005-jwt-rbac-data-scoping.md)
- [ADR-0006 CQRS structure in the backend](../../history/adrs/0006-cqrs-backend.md)

## Operational Notes
Critical — an auth outage blocks every other endpoint. It depends only on PostgreSQL being reachable. Watch `api.5xx` for the `/auth/login` route. General metrics and runbooks: [Observability](../../operations/observability.md), [Operations Guide](../../operations/operations-guide.md).

## Reading Path
1. **Overview** — this file.
2. [Sequence](sequence.md).
3. [Components](components.md).
4. [Contract Usage](contract-usage.md).

## Traceability
- Project brief — confidentiality / role-based access control; see [References](../../knowledge/references.md).
