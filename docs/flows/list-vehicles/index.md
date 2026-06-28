# List Vehicles

**Status:** Validated
**Purpose:** Read vehicles, scoped by role — all (admin), branch-only (branch operator), or owned (owner) — plus lookup by VIN.
**Boundary:** Role-scoped reads of the vehicle registry — list and single by-VIN lookup; no writes.
**Why grouped:** Three vehicle-read endpoints that share the same scoping rules, owner, and failure model.
**Included triggers:** `GET /acme-ev/vehicles`; `GET /acme-ev/vehicles/owner`; `GET /acme-ev/vehicles/:vin`
**Entry point:** `backend/src/vehicles/controllers/vehicles.controller.ts::getVehicles` / `getOwnerVehicles` / `getVehicleByVin`
**Capability:** Fleet Administration
**Owner:** Backend Team
**Criticality:** Medium

## Dependencies
- Services: none beyond the datastore
- Queues/Topics: none
- Databases: PostgreSQL `vehicles`, `vehicle_owners`, `branches` (read)

## Canonical Knowledge
- Domain: [Fleet Administration](../../knowledge/domain.md#fleet-administration), [Data scoping](../../knowledge/domain.md#data-scoping)
- Contracts: [EV Fleet REST API](../../knowledge/contracts.md#ev-fleet-rest-api)
- Entities: [vehicles](../../knowledge/database.md#vehicles), [vehicle_owners](../../knowledge/database.md#vehicle_owners), [branches](../../knowledge/database.md#branches)

## Related Flows
- [Claim Vehicle](../claim-vehicle/index.md) — creates the ownership links the `/owner` endpoint reads
- [Query Status Events](../query-status-events/index.md) — branch operators use VIN lookups alongside status

## Related Decisions
- [ADR-0005 Stateless JWT auth with role-based data scoping](../../history/adrs/0005-jwt-rbac-data-scoping.md)
- [ADR-0006 CQRS structure in the backend](../../history/adrs/0006-cqrs-backend.md)

## Operational Notes
Read-only admin/branch/owner listings. Not on the critical path. General metrics/runbooks: [Observability](../../operations/observability.md).

## Reading Path
1. **Overview** — this file.
2. [Sequence](sequence.md).
3. [Components](components.md).
4. [Persistence Context](persistence.md).
5. [Contract Usage](contract-usage.md).

## Traceability
- Project brief — branch and owner access to their respective vehicles; see [References](../../knowledge/references.md).
