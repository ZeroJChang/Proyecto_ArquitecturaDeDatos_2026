# Claim Vehicle

**Purpose:** Let an owner associate a vehicle with their account by VIN, creating a demo vehicle if the VIN is unknown.
**Trigger:** HTTP — `POST /acme-ev/vehicles/claim`
**Entry point:** `backend/src/vehicles/controllers/vehicles.controller.ts::claimVehicle` → `ClaimVehicleHandler`
**Capability:** Fleet Administration
**Owner:** Backend Team
**Criticality:** Medium

## Dependencies
- Services: `DemoVehicleService`
- Queues/Topics: none
- Databases: PostgreSQL `vehicles`, `vehicle_owners`, `branches` (read for demo assignment)

## Related Flows
- [Query GPS Events](../query-gps-events/) — uses the ownership link this flow creates
- [List Vehicles](../list-vehicles/) — owner vehicle listing reflects claimed vehicles

## Related Decisions
- [ADR-0006 CQRS structure in the backend](../../adrs/0006-cqrs-backend.md)
- [ADR-0005 Stateless JWT auth with role-based data scoping](../../adrs/0005-jwt-rbac-data-scoping.md)

## Operational Notes
The only notable telemetry-adjacent **write** in the backend. Runs in a DB transaction; a failure rolls back cleanly. The demo-vehicle fallback is a demo/defense convenience (see [`domain.md`](domain.md)). General metrics/runbooks: [`observability.md`](../../observability.md).

## Navigation
[Sequence](sequence.md) · [Components](components.md) · [Contracts](contracts.md) · [Domain](domain.md)

## Traceability
- Owner self-service onboarding — claim a vehicle by VIN; see [`references.md`](../../references.md).
