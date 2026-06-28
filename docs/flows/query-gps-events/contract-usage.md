# Query GPS Events — Contract Usage

These two endpoints are part of the [EV Fleet REST API](../../knowledge/contracts.md#ev-fleet-rest-api). The canonical registry owns the interface identity, version, authentication, and compatibility policy; this file documents only how the GPS read operations behave locally. The full schema is the generated Swagger at `/docs`.

## Operation: `GET /acme-ev/gps/events`

| Aspect | Detail |
|--------|--------|
| Authentication | Bearer JWT (`OWNER`; `ADMIN`/`BRANCH_USER` bypass the ownership check) |
| Query params | `vin` (required), `startDate`, `endDate` (ISO 8601), `page` (default 1), `limit` (default 10) |
| Response body | `{ data: GpsEvent[], meta: { total, page, limit, totalPages } }` |
| Status codes | `200` success · `400` invalid params/range · `401` missing or invalid token · `403` not owned |

### Example response (200)

```json
{
  "data": [
    {
      "vin": "ACME0000000000001",
      "eventTimestamp": "2026-06-14T15:30:00.000Z",
      "latitude": 14.6349,
      "longitude": -90.5069
    }
  ],
  "meta": { "total": 1440, "page": 1, "limit": 10, "totalPages": 144 }
}
```

## Operation: `GET /acme-ev/gps/events/download`

| Aspect | Detail |
|--------|--------|
| Authentication | Bearer JWT, role `OWNER` (no privileged bypass) |
| Query params | `vin` (required), `startDate`, `endDate` (required) |
| Response body | `text/csv` with `Content-Disposition: attachment; filename="<vin>_<startDate>_<endDate>.csv"` |
| Status codes | `200` success · `400` invalid range · `401` missing or invalid token · `403` not owned · `404` no data |

### Example response (200)

```csv
"VIN","datetime","latitude","longitude"
"ACME0000000000001","2026-06-14T15:30:00.000Z",14.6349,-90.5069
"ACME0000000000001","2026-06-14T15:30:10.000Z",14.6351,-90.5067
```

The CSV columns are `VIN, datetime, latitude, longitude`; the filename pattern is `<vin>_<startDate>_<endDate>.csv`.

## Validation and failure behavior

- Missing `vin` or malformed dates → `400` from the global `ValidationPipe`.
- `startDate` after `endDate` → `400` ("La fecha de inicio no puede ser mayor a la fecha de fin").
- Caller does not own the `vin` → `403` ("No tienes acceso a este vehículo"); on `/events` this applies to `OWNER` only, since `ADMIN`/`BRANCH_USER` bypass the check.
- Download matching zero rows → `404` ("No hay datos GPS para el rango solicitado").

## Local notes

- Ordering differs by endpoint: `/events` returns newest-first for browsing, `/events/download` oldest-first for a chronological file.
- The access and scoping rules behind these status codes are detailed in [Domain Context](domain-context.md).

---

[Previous: Persistence Context](persistence.md) · [Flow Index](index.md)
