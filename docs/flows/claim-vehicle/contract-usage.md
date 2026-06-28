# Claim Vehicle — Contract Usage

This flow consumes the [EV Fleet REST API](../../knowledge/contracts.md#ev-fleet-rest-api). The canonical registry owns the interface identity, version, and compatibility policy; this file documents only how the claim operation behaves locally.

## Operation: `POST /acme-ev/vehicles/claim`

| Aspect | Detail |
|--------|--------|
| Authentication | Bearer JWT, role `OWNER` |
| Headers | `Content-Type: application/json` |
| Request body | `{ vin: string }` (required) |
| Response body | `{ message: string, vin: string }` |
| Status codes | `200` claimed · `400` invalid or already assigned · `401` · `403` non-owner |

### Example request

```json
{ "vin": "ACME0000000000042" }
```

### Example response (200)

```json
{ "message": "Vehicle claimed successfully", "vin": "ACME0000000000042" }
```

### Example response (400 — already claimed)

```json
{ "statusCode": 400, "message": "Vehicle is already assigned to an owner" }
```

## Validation and failure behavior

- Missing or malformed `vin` → `400` from the global `ValidationPipe`.
- A VIN already linked in `vehicle_owners` → `400` ("Vehicle is already assigned to an owner").
- A non-`OWNER` caller → `403` from `RolesGuard`.

---

[Previous: Domain Context](domain-context.md) · [Flow Index](index.md)
