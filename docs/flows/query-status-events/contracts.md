# Query Status Events — Contracts

Full contract in Swagger `/docs`. Key parts below. All endpoints require `ADMIN` or `BRANCH_USER`.

## `GET /acme-ev/status/events`

| Field | Description |
|-------|-------------|
| Authentication | Bearer JWT |
| Query params | `vin` (optional for ADMIN), `startDate`, `endDate`, `page`, `limit` |
| Response | `{ data: StatusEvent[], meta: {...} }` |
| Status codes | `200` · `400` · `401` · `403` out-of-branch |

## `GET /acme-ev/status/latest/:vin`

| Field | Description |
|-------|-------------|
| Authentication | Bearer JWT |
| Path param | `vin` |
| Response | latest `StatusEvent` document |
| Status codes | `200` · `401` · `403` · `404` no events |

## `GET /acme-ev/status/faults`

| Field | Description |
|-------|-------------|
| Authentication | Bearer JWT |
| Response | `{ data: VehicleWithFault[] }` — latest faulted status per branch vehicle |
| Status codes | `200` (possibly empty) · `401` · `403` |

### Example status event

```json
{
  "vin": "ACME0000000000001",
  "eventTimestamp": "2026-06-14T15:30:00.000Z",
  "bateria": 78.5,
  "encendido": true,
  "codigoProblema": "000",
  "kilometraje": 12345.6
}
```

### Example fault entry

```json
{ "vin": "ACME0000000000007", "eventTimestamp": "2026-06-14T15:31:00.000Z", "codigoProblema": "101" }
```

## Versioning

Stable at API `1.0.0`. The persisted document shape is owned by [Ingest Status](../ingest-status/database.md).
