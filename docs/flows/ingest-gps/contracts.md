# Ingest GPS — Contracts

This flow **consumes** the GPS frame published by [Produce Telemetry](../produce-telemetry/contracts.md).

## Consumed message — topic `acme.ev.gps`

| Field | Description |
|-------|-------------|
| Topic | `acme.ev.gps` (3 partitions) |
| Producer | IoT Producer (real devices in production) |
| Consumer | Spark GPS pipeline (this flow) |
| Offset management | Spark checkpoint at `/opt/spark/work-dir/checkpoints/acme-ev-gps` |
| Retry behavior | Failed batch reprocessed from last committed offset |
| DLQ | None — malformed frames degrade to null fields, not a dead-letter |
| Idempotency | At-least-once; writer appends without dedup |
| Ordering | Per-partition only |

### Consumed schema (`gps_schema`)

| Field | Type | Notes |
|-------|------|-------|
| `id_vehiculo` | string | Vehicle business id |
| `vin` | string | Vehicle identifier |
| `timestamp` | string | ISO 8601; parsed to `event_timestamp` |
| `tipo_trama` | string | `"GPS"` |
| `zona_referencia` | string | Reference zone |
| `departamento` | string | Department/region |
| `telemetria.latitud` | double | Lifted to `latitude` |
| `telemetria.longitud` | double | Lifted to `longitude` |

### Example consumed frame

```json
{
  "id_vehiculo": "EV-ACME-10001",
  "vin": "ACME0000000000001",
  "timestamp": "2026-06-14T15:30:00.000Z",
  "tipo_trama": "GPS",
  "zona_referencia": "Ciudad de Guatemala",
  "departamento": "Guatemala",
  "telemetria": { "latitud": 14.6349, "longitud": -90.5069 }
}
```

The persisted shape (after flattening) is documented in [`database.md`](database.md).

## Versioning

Schema is unversioned. A breaking change to the nested `telemetria` shape requires updating `gps_schema` in `common/schemas.py` and the column extraction in the pipeline.
