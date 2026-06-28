# List Vehicles — Contract Usage

This flow consumes the [EV Fleet REST API](../../knowledge/contracts.md#ev-fleet-rest-api). The canonical registry owns the interface identity, version, and compatibility policy; this file documents only how these three read operations behave locally.

## Operation: `GET /acme-ev/vehicles` (ADMIN, BRANCH_USER)

| Aspect | Detail |
|--------|--------|
| Authentication | Bearer JWT |
| Query params | `page`, `limit` (+ optional search/filter) |
| Response body | `{ data: Vehicle[], meta: {...} }` — ADMIN: all; BRANCH_USER: own branch |
| Status codes | `200` · `401` · `403` |

## Operation: `GET /acme-ev/vehicles/owner` (OWNER)

| Aspect | Detail |
|--------|--------|
| Authentication | Bearer JWT, role `OWNER` |
| Response body | `GetVehicleResponseDto[]` for vehicles linked to the caller |
| Status codes | `200` · `401` · `403` |

## Operation: `GET /acme-ev/vehicles/:vin` (ADMIN, BRANCH_USER)

| Aspect | Detail |
|--------|--------|
| Authentication | Bearer JWT |
| Path param | `vin` |
| Response body | `GetVehicleResponseDto` |
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

---

[Previous: Persistence Context](persistence.md) · [Flow Index](index.md)
