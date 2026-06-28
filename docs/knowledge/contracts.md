# Contracts

Canonical registry for the interfaces the platform exposes and consumes. It owns interface identity, ownership, versions, authentication, and compatibility policy. Flows reference these contracts from their `contract-usage.md` and document only local production, consumption, validation, and failure behavior; they never redefine the contract.

Exhaustive machine-readable schemas are not copied here. The HTTP contract's source of truth is the generated Swagger at `/docs`; the Kafka frame structures are defined by the producer and the Spark parser schemas.

## EV Fleet REST API

| Field | Value |
|-------|-------|
| Name and type | EV Fleet REST API — synchronous HTTP/JSON |
| Purpose | Authenticated read access to telemetry plus fleet administration |
| Owner | Backend Team |
| Producer | Backend API (NestJS, base path `/acme-ev`) |
| Consumers | Frontend SPA; any authenticated API client |
| Version | `1.0.0` (Swagger) |
| Authentication | Bearer JWT on every route except `POST /auth/login`; role gating via `@Roles` + `RolesGuard` |
| Compatibility | Adding optional fields or new endpoints is non-breaking; renaming/removing fields or narrowing accepted values is breaking (see policy below) |
| Specification | Generated Swagger at `/docs` (served by the backend) |
| Related flows | See the operations table |

### Operations

| Operation | Method | Roles | Flow |
|-----------|--------|-------|------|
| `/auth/login` | POST | Public | [Login](../flows/login/index.md) |
| `/users` | GET | ADMIN | [List Users](../flows/list-users/index.md) |
| `/branches` | GET | ADMIN | [List Branches](../flows/list-branches/index.md) |
| `/vehicles` | GET | ADMIN, BRANCH_USER | [List Vehicles](../flows/list-vehicles/index.md) |
| `/vehicles/owner` | GET | OWNER | [List Vehicles](../flows/list-vehicles/index.md) |
| `/vehicles/claim` | POST | OWNER | [Claim Vehicle](../flows/claim-vehicle/index.md) |
| `/vehicles/:vin` | GET | ADMIN, BRANCH_USER | [List Vehicles](../flows/list-vehicles/index.md) |
| `/gps/events` | GET | OWNER (ADMIN/BRANCH_USER bypass) | [Query GPS Events](../flows/query-gps-events/index.md) |
| `/gps/events/download` | GET | OWNER | [Query GPS Events](../flows/query-gps-events/index.md) |
| `/status/events` | GET | ADMIN, BRANCH_USER | [Query Status Events](../flows/query-status-events/index.md) |
| `/status/latest/:vin` | GET | ADMIN, BRANCH_USER | [Query Status Events](../flows/query-status-events/index.md) |
| `/status/faults` | GET | ADMIN, BRANCH_USER | [Query Status Events](../flows/query-status-events/index.md) |
| `/dashboard/admin` | GET | ADMIN | [View Dashboards](../flows/view-dashboards/index.md) |
| `/dashboard/branch` | GET | BRANCH_USER | [View Dashboards](../flows/view-dashboards/index.md) |

The authentication token is issued by [Login](../flows/login/index.md): the response field `accessToken` is sent on subsequent requests as `Authorization: Bearer <accessToken>`. JWT claims are `{ sub, email, role, branchId }`.

## GPS Telemetry Topic

| Field | Value |
|-------|-------|
| Name and type | `acme.ev.gps` — Kafka topic (3 partitions) |
| Purpose | Durable transport of GPS position frames from devices to ingestion |
| Owner | Data Platform Team |
| Producer | IoT Producer (real devices in production) |
| Consumers | Spark GPS pipeline |
| Version | Unversioned; one frame shape |
| Authentication | None (in-cluster transport; secured at the network layer) |
| Compatibility | Changing the nested `telemetria` shape requires a coordinated update to the GPS parser schema |
| Specification | Producer frame in [`iot-producer/src/simulator.js`](../../iot-producer/src/simulator.js); parser `gps_schema` in [`spark/jobs/common/schemas.py`](../../spark/jobs/common/schemas.py) |
| Related flows | [Produce Telemetry](../flows/produce-telemetry/index.md) (produces), [Ingest GPS](../flows/ingest-gps/index.md) (consumes) |

A GPS frame carries `id_vehiculo`, `vin`, `timestamp`, `tipo_trama` (`"GPS"`), `zona_referencia`, `departamento`, and a nested `telemetria` with `latitud` and `longitud`. Ordering is per-partition only; there is no idempotency key.

## Status Telemetry Topic

| Field | Value |
|-------|-------|
| Name and type | `acme.ev.status` — Kafka topic (3 partitions) |
| Purpose | Durable transport of operational status frames from devices to ingestion |
| Owner | Data Platform Team |
| Producer | IoT Producer (real devices in production) |
| Consumers | Spark Status pipeline |
| Version | Unversioned; forward-compatible by design |
| Authentication | None (in-cluster transport; secured at the network layer) |
| Compatibility | Future vehicle models add unknown `telemetria` fields; the document store absorbs them, but persisting a new field requires extending the parser schema |
| Specification | Producer frame in [`iot-producer/src/simulator.js`](../../iot-producer/src/simulator.js); parser `status_schema` in [`spark/jobs/common/schemas.py`](../../spark/jobs/common/schemas.py) |
| Related flows | [Produce Telemetry](../flows/produce-telemetry/index.md) (produces), [Ingest Status](../flows/ingest-status/index.md) (consumes) |

A status frame carries `id_vehiculo`, `vin`, `timestamp`, `tipo_trama` (`"ESTADO"`), `zona_referencia`, `departamento`, and a nested `telemetria` with `estado_bateria_porcentaje`, `encendido`, `codigo_problema`, and `kilometraje`. The forward-compatible status schema is the reason status data lives in MongoDB ([ADR-0002](../history/adrs/0002-polyglot-persistence.md)).

## Compatibility Policy

| Change | Default classification | Required response |
|--------|------------------------|-------------------|
| Add optional field | Non-breaking | Existing consumers continue unchanged |
| Add required field | Breaking | New version or compatibility shim |
| Remove field | Breaking | Deprecation window and migration guidance |
| Narrow accepted values | Breaking | Consumer migration before cutoff |
| Widen emitted values | Potentially breaking | Verify consumers tolerate unknown values |

A breaking change requires a deprecation window, a consumer-impact summary, migration guidance, and a rollout/rollback plan. For the REST API the immediate consumer is the Frontend SPA; for the telemetry topics the consumers are the Spark pipelines.
