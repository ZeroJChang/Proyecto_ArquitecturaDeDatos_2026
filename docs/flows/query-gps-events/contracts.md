# Query GPS Events — Contracts

Full contract in Swagger `/docs`. Key parts below.

## `GET /acme-ev/gps/events`

| Field | Description |
|-------|-------------|
| Endpoint | `GET /acme-ev/gps/events` |
| Authentication | Bearer JWT |
| Query params | `vin` (required), `startDate`, `endDate` (ISO), `page` (default 1), `limit` (default 10) |
| Response | `{ data: GpsEvent[], meta: { total, page, limit, totalPages } }` |
| Status codes | `200` · `400` invalid params/range · `401` · `403` not owned |

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

## `GET /acme-ev/gps/events/download`

| Field | Description |
|-------|-------------|
| Endpoint | `GET /acme-ev/gps/events/download` |
| Authentication | Bearer JWT, role `OWNER` |
| Query params | `vin` (required), `startDate`, `endDate` (required) |
| Response | `text/csv` with `Content-Disposition: attachment` |
| Status codes | `200` · `400` invalid range · `401` · `403` not owned · `404` no data |

### Example response (200)

```csv
"VIN","datetime","latitude","longitude"
"ACME0000000000001","2026-06-14T15:30:00.000Z",14.6349,-90.5069
"ACME0000000000001","2026-06-14T15:30:10.000Z",14.6351,-90.5067
```

Filename pattern: `<vin>_<startDate>_<endDate>.csv`.

## Versioning

Stable at API `1.0.0`. The CSV column set (`VIN, datetime, latitude, longitude`) matches the project requirement for owner GPS export; changing it is a breaking change for consumers of the file.
