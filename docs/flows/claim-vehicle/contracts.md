# Claim Vehicle — Contracts

Full contract in Swagger `/docs`. Key parts below.

## `POST /acme-ev/vehicles/claim`

| Field | Description |
|-------|-------------|
| Endpoint | `POST /acme-ev/vehicles/claim` |
| Authentication | Bearer JWT, role `OWNER` |
| Headers | `Content-Type: application/json` |
| Request body | `{ vin: string }` (required) |
| Response | `{ message: string, vin: string }` |
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

## Versioning

Stable at API `1.0.0`. The response shape is minimal by design; adding fields (e.g. the generated vehicle's model) would be backward compatible.
