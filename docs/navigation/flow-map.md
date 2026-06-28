# Flow Map

All flows grouped by business capability. Each flow owns a package under [`flows/<flow-name>/`](../flows/) and references the [Canonical Knowledge Registries](../knowledge/index.md).

## Telemetry Ingestion

How vehicle telemetry enters the platform and lands in storage.

| Flow | Included triggers | Purpose | Documentation |
|------|-------------------|---------|---------------|
| Produce Telemetry | Interval timer (every `SIMULATION_INTERVAL_MS`) | Simulate EV telemetry and publish GPS + status frames to Kafka | [Produce Telemetry](../flows/produce-telemetry/index.md) |
| Ingest GPS | Kafka consumer — `acme.ev.gps` | Parse GPS frames and persist them to PostgreSQL `gps_events` | [Ingest GPS](../flows/ingest-gps/index.md) |
| Ingest Status | Kafka consumer — `acme.ev.status` | Parse status frames and persist them to MongoDB `status_events` | [Ingest Status](../flows/ingest-status/index.md) |

## Identity & Access

| Flow | Included triggers | Purpose | Documentation |
|------|-------------------|---------|---------------|
| Login | `POST /acme-ev/auth/login` | Authenticate a user and issue a JWT with role + branch claims | [Login](../flows/login/index.md) |

## Vehicle Telemetry Access

| Flow | Included triggers | Purpose | Documentation |
|------|-------------------|---------|---------------|
| Query GPS Events | `GET /acme-ev/gps/events`; `GET /acme-ev/gps/events/download` | Let an owner read and download GPS history for their own vehicles | [Query GPS Events](../flows/query-gps-events/index.md) |

## Fleet Monitoring

| Flow | Included triggers | Purpose | Documentation |
|------|-------------------|---------|---------------|
| Query Status Events | `GET /acme-ev/status/events`; `/status/latest/:vin`; `/status/faults` | Let admins/branch operators inspect operational status and active faults | [Query Status Events](../flows/query-status-events/index.md) |
| View Dashboards | `GET /acme-ev/dashboard/admin`; `/dashboard/branch` | Aggregate fleet metrics for admin and branch operators | [View Dashboards](../flows/view-dashboards/index.md) |

## Fleet Administration

| Flow | Included triggers | Purpose | Documentation |
|------|-------------------|---------|---------------|
| Claim Vehicle | `POST /acme-ev/vehicles/claim` | Let an owner claim a vehicle by VIN, creating a demo vehicle if unknown | [Claim Vehicle](../flows/claim-vehicle/index.md) |
| List Vehicles | `GET /acme-ev/vehicles`; `/vehicles/owner`; `/vehicles/:vin` | Read vehicles scoped by role (all / branch / owner) | [List Vehicles](../flows/list-vehicles/index.md) |
| List Branches | `GET /acme-ev/branches` | List branches with vehicle/owner counts (admin) | [List Branches](../flows/list-branches/index.md) |
| List Users | `GET /acme-ev/users` | List users with search, role filter, and sorting (admin) | [List Users](../flows/list-users/index.md) |
