# Ingest GPS

**Status:** Validated
**Purpose:** Consume GPS frames from Kafka, flatten the telemetry, and append them to PostgreSQL `gps_events`.
**Boundary:** From a consumed `acme.ev.gps` frame to a durably appended `gps_events` row; frame generation and downstream reads are out of scope.
**Why grouped:** A single trigger with one outcome, owner, and failure model.
**Included triggers:** Kafka consumer — topic `acme.ev.gps`
**Entry point:** `spark/jobs/pipelines/process_gps_stream.py`
**Capability:** Telemetry Ingestion
**Owner:** Data Platform Team
**Criticality:** Critical

## Dependencies
- Services: Spark cluster (master + workers)
- Queues/Topics: `acme.ev.gps` (consumes)
- Databases: PostgreSQL `gps_events` (writes, JDBC append)

## Canonical Knowledge
- Domain: [Telemetry Ingestion](../../knowledge/domain.md#telemetry-ingestion)
- Contracts: [GPS Telemetry Topic](../../knowledge/contracts.md#gps-telemetry-topic)
- Entities: [gps_events](../../knowledge/database.md#gps_events)

## Related Flows
- [Produce Telemetry](../produce-telemetry/index.md) — publishes the frames this pipeline consumes
- [Query GPS Events](../query-gps-events/index.md) — reads the rows this pipeline writes

## Related Decisions
- [ADR-0004 Spark Structured Streaming with checkpointed offsets](../../history/adrs/0004-spark-checkpointing.md)
- [ADR-0002 Polyglot persistence](../../history/adrs/0002-polyglot-persistence.md)
- [ADR-0001 Kappa streaming architecture](../../history/adrs/0001-kappa-architecture.md)

## Operational Notes
Critical flow — this is the GPS half of the platform's data ingestion. Watch `spark.query.running`, `kafka.topic.lag` for `acme.ev.gps`, and `db.write.errors`. Recovery: re-submit the pipeline (resumes from checkpoint). Full metrics and runbooks: [Observability](../../operations/observability.md), [Operations Guide](../../operations/operations-guide.md).

## Reading Path
1. **Overview** — this file.
2. [Sequence](sequence.md).
3. [Components](components.md).
4. [Persistence Context](persistence.md).
5. [Contract Usage](contract-usage.md).
6. [Installation](installation.md).

## Traceability
- Project brief deliverable P1 — "Ingesta de datos GPS" (IoT → Kafka → Spark → PostgreSQL); see [References](../../knowledge/references.md).
