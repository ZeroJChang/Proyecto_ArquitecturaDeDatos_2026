# Ingest GPS

**Purpose:** Consume GPS frames from Kafka, flatten the telemetry, and append them to PostgreSQL `gps_events`.
**Trigger:** Kafka consumer — topic `acme.ev.gps`
**Entry point:** `spark/jobs/pipelines/process_gps_stream.py`
**Capability:** Telemetry Ingestion
**Owner:** Data Platform Team
**Criticality:** Critical

## Dependencies
- Services: Spark cluster (master + workers)
- Queues/Topics: `acme.ev.gps` (consumes)
- Databases: PostgreSQL `gps_events` (writes, JDBC append)

## Related Flows
- [Produce Telemetry](../produce-telemetry/) — publishes the frames this pipeline consumes
- [Query GPS Events](../query-gps-events/) — reads the rows this pipeline writes

## Related Decisions
- [ADR-0004 Spark Structured Streaming with checkpointed offsets](../../adrs/0004-spark-checkpointing.md)
- [ADR-0002 Polyglot persistence](../../adrs/0002-polyglot-persistence.md)
- [ADR-0001 Kappa streaming architecture](../../adrs/0001-kappa-architecture.md)

## Operational Notes
Critical flow — this is the GPS half of the platform's data ingestion. Watch `spark.query.running`, `kafka.topic.lag` for `acme.ev.gps`, and `db.write.errors`. Recovery: re-submit the pipeline (resumes from checkpoint). Full metrics and runbooks: [`observability.md`](../../observability.md), [`operations-guide.md`](../../operations-guide.md).

## Navigation
[Sequence](sequence.md) · [Components](components.md) · [Contracts](contracts.md) · [Database](database.md) · [Installation](installation.md)

## Traceability
- Project brief deliverable P1 — "Ingesta de datos GPS" (IoT → Kafka → Spark → PostgreSQL); see [`references.md`](../../references.md).
