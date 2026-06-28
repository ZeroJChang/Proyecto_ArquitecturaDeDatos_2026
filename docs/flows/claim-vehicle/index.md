# Claim Vehicle

**Status:** Validated
**Purpose:** Let an owner associate a vehicle with their account by VIN, creating a demo vehicle if the VIN is unknown.
**Boundary:** From an owner's VIN submission to a committed ownership link; a demo vehicle is auto-created only when the VIN is unknown.
**Why grouped:** A single trigger with one outcome (an owner↔vehicle ownership link), one owner, and one failure model.
**Included triggers:** `POST /acme-ev/vehicles/claim`
**Entry point:** `backend/src/vehicles/controllers/vehicles.controller.ts::claimVehicle` → `ClaimVehicleHandler`
**Capability:** Fleet Administration
**Owner:** Backend Team
**Criticality:** Medium

## Dependencies
- Services: `DemoVehicleService`
- Queues/Topics: none
- Databases: PostgreSQL `vehicles`, `vehicle_owners`, `branches` (read for demo assignment)

## Canonical Knowledge
- Domain: [Fleet Administration](../../knowledge/domain.md#fleet-administration)
- Contracts: [EV Fleet REST API](../../knowledge/contracts.md#ev-fleet-rest-api)
- Entities: [vehicles](../../knowledge/database.md#vehicles), [vehicle_owners](../../knowledge/database.md#vehicle_owners), [branches](../../knowledge/database.md#branches)
- Constraint: [single owner per vehicle](../../knowledge/database.md#6-constraints)

## Related Flows
- [Query GPS Events](../query-gps-events/index.md) — uses the ownership link this flow creates
- [List Vehicles](../list-vehicles/index.md) — owner vehicle listing reflects claimed vehicles

## Related Decisions
- [ADR-0006 CQRS structure in the backend](../../history/adrs/0006-cqrs-backend.md)
- [ADR-0005 Stateless JWT auth with role-based data scoping](../../history/adrs/0005-jwt-rbac-data-scoping.md)

## Operational Notes
The only notable telemetry-adjacent **write** in the backend. Runs in a DB transaction; a failure rolls back cleanly. The demo-vehicle fallback is a demo/defense convenience (see [domain-context.md](domain-context.md)). General metrics/runbooks: [Observability](../../operations/observability.md).

## Reading Path
1. **Overview** — this file.
2. [Sequence](sequence.md).
3. [Components](components.md).
4. [Domain Context](domain-context.md).
5. [Contract Usage](contract-usage.md).

## Traceability
- Owner self-service onboarding — claim a vehicle by VIN; see [References](../../knowledge/references.md).
