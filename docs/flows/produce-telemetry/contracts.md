# Produce Telemetry — Contracts

This flow **produces** two Kafka message types. The same schemas are consumed by [Ingest GPS](../ingest-gps/contracts.md) and [Ingest Status](../ingest-status/contracts.md).

## GPS frame — topic `acme.ev.gps`

| Field | Description |
|-------|-------------|
| Topic | `acme.ev.gps` (3 partitions) |
| Producer | IoT Producer |
| Consumer | Spark GPS pipeline |
| Retry behavior | KafkaJS producer retries; no app-level replay |
| Ordering | Per-partition only (no global ordering guarantee) |
| Idempotency | None — each frame is a fresh sample |

Example message:

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

## Status frame — topic `acme.ev.status`

| Field | Description |
|-------|-------------|
| Topic | `acme.ev.status` (3 partitions) |
| Producer | IoT Producer |
| Consumer | Spark Status pipeline |
| Retry behavior | KafkaJS producer retries; no app-level replay |
| Ordering | Per-partition only |
| Idempotency | None |

Example message:

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

## Versioning

Frames are unversioned today. Because status frames will gain unknown future fields, the consumer schema ([Ingest Status](../ingest-status/)) tolerates extra keys (document store). A breaking change to GPS frame structure would require coordinated updates to the GPS parser schema.
