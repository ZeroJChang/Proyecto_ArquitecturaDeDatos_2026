# List Vehicles — Contracts

Full contract in Swagger `/docs`. Key parts below.

## `GET /acme-ev/vehicles` (ADMIN, BRANCH_USER)

| Field | Description |
|-------|-------------|
| Authentication | Bearer JWT |
| Query params | `page`, `limit` (+ optional search/filter) |
| Response | `{ data: Vehicle[], meta: {...} }` — ADMIN: all; BRANCH_USER: own branch |
| Status codes | `200` · `401` · `403` |

## `GET /acme-ev/vehicles/owner` (OWNER)

| Field | Description |
|-------|-------------|
| Authentication | Bearer JWT, role `OWNER` |
| Response | `GetVehicleResponseDto[]` for vehicles linked to the caller |
| Status codes | `200` · `401` · `403` |

## `GET /acme-ev/vehicles/:vin` (ADMIN, BRANCH_USER)

| Field | Description |
|-------|-------------|
| Authentication | Bearer JWT |
| Path param | `vin` |
| Response | `GetVehicleResponseDto` |
| Status codes | `200` · `401` · `403` out-of-branch · `404` unknown VIN |

### Example vehicle DTO

```json
{
  "vin": "ACME0000000000001",
  "idVehiculo": "EV-ACME-10001",
  "model": "ACME Volt",
  "year": 2026,
  "branchId": 1
}
```

## Versioning

Stable at API `1.0.0`.
