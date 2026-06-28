# Ingest Status — Contract Usage

This flow **consumes** the [Status Telemetry Topic](../../knowledge/contracts.md#status-telemetry-topic). The canonical registry owns the topic identity, partitioning, and compatibility policy; this file documents only how the status pipeline consumes it locally.

## Consumed: `acme.ev.status`

| Aspect | Detail |
|--------|--------|
| Role | Consumer — Spark Status pipeline |
| Offset management | Spark checkpoint at `/opt/spark/work-dir/checkpoints/acme-ev-status` |
| Retry behavior | Failed batch reprocessed from the last committed offset |
| DLQ | None — malformed frames degrade to null fields, not a dead-letter |
| Idempotency | At-least-once; the connector appends without dedup |
| Ordering | Per-partition only |

### Consumed field mapping (`status_schema`)

| Frame field | Type | Local handling |
|-------------|------|----------------|
| `id_vehiculo` | string | stored as-is |
| `vin` | string | stored as-is |
| `timestamp` | string | ISO 8601; parsed to `event_timestamp` |
| `tipo_trama` | string | `"ESTADO"` |
| `zona_referencia` | string | stored as-is |
| `departamento` | string | stored as-is |
| `telemetria.estado_bateria_porcentaje` | double | lifted to `bateria` |
| `telemetria.encendido` | boolean | lifted to `encendido` |
| `telemetria.codigo_problema` | string | lifted to `codigo_problema` |
| `telemetria.kilometraje` | double | lifted to `kilometraje` |

Fields absent or mistyped relative to `status_schema` parse to `null` rather than failing the batch. The persisted shape is described in [Persistence Context](persistence.md).

### Example consumed frame

```json
{
  "id_vehiculo": "EV-ACME-10001",
  "vin": "ACME0000000000001",
  "timestamp": "2026-06-14T15:30:00.000Z",
  "tipo_trama": "ESTADO",
  "zona_referencia": "Ciudad de Guatemala",
  "departamento": "Guatemala",
  "telemetria": {
    "estado_bateria_porcentaje": 78.5,
    "encendido": true,
    "codigo_problema": "000",
    "kilometraje": 12345.6
  }
}
```

## Local notes

- `processed_at` is added at ingestion; the original `timestamp` and nested `telemetria` are dropped after flattening.
- Persisting a new `telemetria` field requires extending `status_schema` and the column extraction; until then the document store simply absorbs the unknown keys without promoting them to typed fields.

---

[Previous: Persistence Context](persistence.md) · [Flow Index](index.md) · [Next: Installation](installation.md)
