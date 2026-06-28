# Produce Telemetry

**Status:** Validated
**Purpose:** Simulate a fleet of electric vehicles and publish their GPS and status frames to Kafka.
**Boundary:** From a simulated vehicle tick to GPS and status frames published on Kafka; downstream ingestion and storage are out of scope.
**Why grouped:** A single trigger with one outcome, owner, and failure model.
**Included triggers:** Interval timer — `setInterval(tick, SIMULATION_INTERVAL_MS)` (default 10s)
**Entry point:** `iot-producer/src/index.js` → `simulator.js::start` / `tick`
**Capability:** Telemetry Ingestion
**Owner:** Data Platform Team
**Criticality:** High

## Dependencies
- Services: none (standalone Node.js process)
- Queues/Topics: `acme.ev.gps`, `acme.ev.status` (publishes)
- Databases: none

## Canonical Knowledge
- Domain: [Telemetry Ingestion](../../knowledge/domain.md#telemetry-ingestion), [Fault code semantics](../../knowledge/domain.md#fault-code-semantics)
- Contracts: [GPS Telemetry Topic](../../knowledge/contracts.md#gps-telemetry-topic), [Status Telemetry Topic](../../knowledge/contracts.md#status-telemetry-topic)

## Related Flows
- [Ingest GPS](../ingest-gps/index.md) — consumes the `acme.ev.gps` frames this flow publishes
- [Ingest Status](../ingest-status/index.md) — consumes the `acme.ev.status` frames this flow publishes

## Related Decisions
- [ADR-0003 Kafka in KRaft mode](../../history/adrs/0003-kafka-kraft-broker.md)
- [ADR-0001 Kappa streaming architecture](../../history/adrs/0001-kappa-architecture.md)

## Operational Notes
In production this simulator is **replaced by real IoT devices**; the Kafka contract stays identical. It is the entry point of the whole data pipeline, so a stalled producer means no new telemetry — watch the topic end-offsets (see [Observability](../../operations/observability.md)).

## Reading Path
1. **Overview** — this file.
2. [Sequence](sequence.md).
3. [Components](components.md).
4. [Domain Context](domain-context.md).
5. [Contract Usage](contract-usage.md).

## Traceability
- Project brief — telemetry generation (GPS every 30s, status every 60s); see [References](../../knowledge/references.md). The simulator emits both frames on a single configurable tick.
