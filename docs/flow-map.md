# Flow Map

All flows grouped by business capability. Each flow owns a package under [`flows/<flow-name>/`](flows/).

## Telemetry Ingestion

How vehicle telemetry enters the platform and lands in storage.

| Flow | Trigger | Purpose | Docs |
|------|---------|---------|------|
| Produce Telemetry | Interval timer (every `SIMULATION_INTERVAL_MS`) | Simulate EV telemetry and publish GPS + status frames to Kafka | [`flows/produce-telemetry/`](flows/produce-telemetry/) |
| Ingest GPS | Kafka consumer — `acme.ev.gps` | Parse GPS frames and persist them to PostgreSQL `gps_events` | [`flows/ingest-gps/`](flows/ingest-gps/) |
| Ingest Status | Kafka consumer — `acme.ev.status` | Parse status frames and persist them to MongoDB `status_events` | [`flows/ingest-status/`](flows/ingest-status/) |

## Identity & Access

| Flow | Trigger | Purpose | Docs |
|------|---------|---------|------|
| Login | HTTP `POST /acme-ev/auth/login` | Authenticate a user and issue a JWT with role + branch claims | [`flows/login/`](flows/login/) |

## Vehicle Telemetry Access

| Flow | Trigger | Purpose | Docs |
|------|---------|---------|------|
| Query GPS Events | HTTP `GET /acme-ev/gps/events`, `GET /acme-ev/gps/events/download` | Let an owner read and download GPS history for their own vehicles | [`flows/query-gps-events/`](flows/query-gps-events/) |

## Fleet Monitoring

| Flow | Trigger | Purpose | Docs |
|------|---------|---------|------|
| Query Status Events | HTTP `GET /acme-ev/status/events`, `/status/latest/:vin`, `/status/faults` | Let admins/branch operators inspect operational status and active faults | [`flows/query-status-events/`](flows/query-status-events/) |
| View Dashboards | HTTP `GET /acme-ev/dashboard/admin`, `/dashboard/branch` | Aggregate fleet metrics for admin and branch operators | [`flows/view-dashboards/`](flows/view-dashboards/) |

## Fleet Administration

| Flow | Trigger | Purpose | Docs |
|------|---------|---------|------|
| Claim Vehicle | HTTP `POST /acme-ev/vehicles/claim` | Let an owner claim a vehicle by VIN, creating a demo vehicle if unknown | [`flows/claim-vehicle/`](flows/claim-vehicle/) |
| List Vehicles | HTTP `GET /acme-ev/vehicles`, `/vehicles/owner`, `/vehicles/:vin` | Read vehicles scoped by role (all / branch / owner) | [`flows/list-vehicles/`](flows/list-vehicles/) |
| List Branches | HTTP `GET /acme-ev/branches` | List branches with vehicle/owner counts (admin) | [`flows/list-branches/`](flows/list-branches/) |
| List Users | HTTP `GET /acme-ev/users` | List users with search, role filter, and sorting (admin) | [`flows/list-users/`](flows/list-users/) |
