# Ingest Status — Contracts

This flow **consumes** the status frame published by [Produce Telemetry](../produce-telemetry/contracts.md).

## Consumed message — topic `acme.ev.status`

| Field | Description |
|-------|-------------|
| Topic | `acme.ev.status` (3 partitions) |
| Producer | IoT Producer (real devices in production) |
| Consumer | Spark Status pipeline (this flow) |
| Offset management | Spark checkpoint at `/opt/spark/work-dir/checkpoints/acme-ev-status` |
| Retry behavior | Failed batch reprocessed from last committed offset |
| DLQ | None — malformed frames degrade to null fields |
| Idempotency | At-least-once; connector appends without dedup |
| Ordering | Per-partition only |

### Consumed schema (`status_schema`)

| Field | Type | Notes |
|-------|------|-------|
| `id_vehiculo` | string | Vehicle business id |
| `vin` | string | Vehicle identifier |
| `timestamp` | string | ISO 8601; parsed to `event_timestamp` |
| `tipo_trama` | string | `"ESTADO"` |
| `zona_referencia` | string | Reference zone |
| `departamento` | string | Department/region |
| `telemetria.estado_bateria_porcentaje` | double | Lifted to `bateria` |
| `telemetria.encendido` | boolean | Lifted to `encendido` |
| `telemetria.codigo_problema` | string | Lifted to `codigo_problema` |
| `telemetria.kilometraje` | double | Lifted to `kilometraje` |

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

The persisted document shape (after flattening) is documented in [`database.md`](database.md).

## Versioning

Unversioned. Future vehicle models will add unknown fields to `telemetria`; the document store absorbs them, but to persist new fields they must be added to `status_schema` and the column extraction. This forward-compatibility is the reason status data lives in MongoDB ([ADR-0002](../../adrs/0002-polyglot-persistence.md)).
