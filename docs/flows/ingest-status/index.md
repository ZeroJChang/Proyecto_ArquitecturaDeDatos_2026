# Ingest Status

**Purpose:** Consume operational status frames from Kafka, flatten the telemetry, and append them to MongoDB `status_events`.
**Trigger:** Kafka consumer — topic `acme.ev.status`
**Entry point:** `spark/jobs/pipelines/process_status_stream.py`
**Capability:** Telemetry Ingestion
**Owner:** Data Platform Team
**Criticality:** Critical

## Dependencies
- Services: Spark cluster (master + workers)
- Queues/Topics: `acme.ev.status` (consumes)
- Databases: MongoDB `status_events` (writes, Mongo Spark connector)

## Related Flows
- [Produce Telemetry](../produce-telemetry/) — publishes the frames this pipeline consumes
- [Query Status Events](../query-status-events/) — reads the documents this pipeline writes
- [View Dashboards](../view-dashboards/) — uses fault data derived from these documents

## Related Decisions
- [ADR-0004 Spark Structured Streaming with checkpointed offsets](../../adrs/0004-spark-checkpointing.md)
- [ADR-0002 Polyglot persistence](../../adrs/0002-polyglot-persistence.md)
- [ADR-0001 Kappa streaming architecture](../../adrs/0001-kappa-architecture.md)

## Operational Notes
Critical flow — the status half of ingestion. Watch `spark.query.running`, `kafka.topic.lag` for `acme.ev.status`, and `db.write.errors`. Recovery: re-submit the pipeline (resumes from checkpoint). Full metrics and runbooks: [`observability.md`](../../observability.md), [`operations-guide.md`](../../operations-guide.md).

## Navigation
[Sequence](sequence.md) · [Components](components.md) · [Contracts](contracts.md) · [Database](database.md) · [Installation](installation.md)

## Traceability
- Project brief deliverable P2 — "Ingesta de datos de Estado" (IoT → Kafka → Spark → MongoDB); see [`references.md`](../../references.md).
