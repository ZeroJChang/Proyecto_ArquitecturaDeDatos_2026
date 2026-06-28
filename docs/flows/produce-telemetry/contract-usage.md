# Produce Telemetry — Contract Usage

This flow **produces** the [GPS Telemetry Topic](../../knowledge/contracts.md#gps-telemetry-topic) and the [Status Telemetry Topic](../../knowledge/contracts.md#status-telemetry-topic). The canonical registry owns each topic's identity, partitioning, and compatibility policy; this file documents only how this producer publishes locally.

## Produced: `acme.ev.gps`

| Aspect | Detail |
|--------|--------|
| Role | Producer (simulator; real devices in production) |
| Retry behavior | KafkaJS producer retries for transient broker errors; no application-level replay of a dropped frame |
| Ordering | Per-partition only; no global ordering guarantee |
| Idempotency | None — each tick emits a fresh sample stamped with the current timestamp |
| Delivery | A failed publish is isolated by `Promise.allSettled`; that frame is simply lost (no durable producer-side buffer) |

### Example produced frame

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

## Produced: `acme.ev.status`

| Aspect | Detail |
|--------|--------|
| Role | Producer (simulator; real devices in production) |
| Retry behavior | KafkaJS producer retries; no application-level replay |
| Ordering | Per-partition only |
| Idempotency | None |
| Delivery | A failed publish is isolated per frame via `Promise.allSettled` |

### Example produced frame

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

- Both frames are published on a single tick per vehicle. The producer performs no schema validation — the frame shape is fixed and enforced downstream by the Spark parsers ([Ingest GPS](../ingest-gps/index.md), [Ingest Status](../ingest-status/index.md)).
- The nested `telemetria` object is flattened by the consumers at ingestion, not here.

---

[Previous: Domain Context](domain-context.md) · [Flow Index](index.md)
