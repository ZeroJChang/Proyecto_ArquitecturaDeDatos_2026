# Produce Telemetry

**Purpose:** Simulate a fleet of electric vehicles and publish their GPS and status frames to Kafka.
**Trigger:** Interval timer — `setInterval(tick, SIMULATION_INTERVAL_MS)` (default 10s)
**Entry point:** `iot-producer/src/index.js` → `simulator.js::start` / `tick`
**Capability:** Telemetry Ingestion
**Owner:** Data Platform Team
**Criticality:** High

## Dependencies
- Services: none (standalone Node.js process)
- Queues/Topics: `acme.ev.gps`, `acme.ev.status` (publishes)
- Databases: none

## Related Flows
- [Ingest GPS](../ingest-gps/) — consumes the `acme.ev.gps` frames this flow publishes
- [Ingest Status](../ingest-status/) — consumes the `acme.ev.status` frames this flow publishes

## Related Decisions
- [ADR-0003 Kafka in KRaft mode](../../adrs/0003-kafka-kraft-broker.md)
- [ADR-0001 Kappa streaming architecture](../../adrs/0001-kappa-architecture.md)

## Operational Notes
In production this simulator is **replaced by real IoT devices**; the Kafka contract stays identical. It is the entry point of the whole data pipeline, so a stalled producer means no new telemetry — watch the topic end-offsets (see [`observability.md`](../../observability.md)).

## Navigation
[Sequence](sequence.md) · [Components](components.md) · [Contracts](contracts.md) · [Domain](domain.md)

## Traceability
- Project brief — telemetry generation (GPS every 30s, status every 60s); see [`references.md`](../../references.md). The simulator emits both frames on a single configurable tick.
