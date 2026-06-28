# Ingest GPS — Contract Usage

This flow **consumes** the [GPS Telemetry Topic](../../knowledge/contracts.md#gps-telemetry-topic). The canonical registry owns the topic identity, partitioning, and compatibility policy; this file documents only how the GPS pipeline consumes it locally.

## Consumed: `acme.ev.gps`

| Aspect | Detail |
|--------|--------|
| Role | Consumer — Spark GPS pipeline |
| Offset management | Spark checkpoint at `/opt/spark/work-dir/checkpoints/acme-ev-gps` |
| Retry behavior | Failed batch reprocessed from the last committed offset |
| DLQ | None — malformed frames degrade to null fields, not a dead-letter |
| Idempotency | At-least-once; the writer appends without dedup |
| Ordering | Per-partition only |

### Consumed field mapping (`gps_schema`)

| Frame field | Type | Local handling |
|-------------|------|----------------|
| `id_vehiculo` | string | stored as-is |
| `vin` | string | stored as-is |
| `timestamp` | string | ISO 8601; parsed to `event_timestamp` |
| `tipo_trama` | string | `"GPS"` |
| `zona_referencia` | string | stored as-is |
| `departamento` | string | stored as-is |
| `telemetria.latitud` | double | lifted to `latitude` |
| `telemetria.longitud` | double | lifted to `longitude` |

Fields absent or mistyped relative to `gps_schema` parse to `null` rather than failing the batch. The persisted shape is described in [Persistence Context](persistence.md).

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

## Local notes

- `processed_at` is added at ingestion; the original `timestamp` and nested `telemetria` are dropped after flattening.
- Persisting a new `telemetria` field requires extending the parser schema (`gps_schema` in `common/schemas.py`) and the column extraction in the pipeline.

---

[Previous: Persistence Context](persistence.md) · [Flow Index](index.md) · [Next: Installation](installation.md)
