# Ingest Status

**Status:** Validated
**Purpose:** Consume operational status frames from Kafka, flatten the telemetry, and append them to MongoDB `status_events`.
**Boundary:** From a consumed `acme.ev.status` frame to a durably appended `status_events` document; frame generation and downstream reads are out of scope.
**Why grouped:** A single trigger with one outcome, owner, and failure model.
**Included triggers:** Kafka consumer — topic `acme.ev.status`
**Entry point:** `spark/jobs/pipelines/process_status_stream.py`
**Capability:** Telemetry Ingestion
**Owner:** Data Platform Team
**Criticality:** Critical

## Dependencies
- Services: Spark cluster (master + workers)
- Queues/Topics: `acme.ev.status` (consumes)
- Databases: MongoDB `status_events` (writes, Mongo Spark connector)

## Canonical Knowledge
- Domain: [Telemetry Ingestion](../../knowledge/domain.md#telemetry-ingestion)
- Contracts: [Status Telemetry Topic](../../knowledge/contracts.md#status-telemetry-topic)
- Entities: [status_events](../../knowledge/database.md#status_events)

## Related Flows
- [Produce Telemetry](../produce-telemetry/index.md) — publishes the frames this pipeline consumes
- [Query Status Events](../query-status-events/index.md) — reads the documents this pipeline writes
- [View Dashboards](../view-dashboards/index.md) — uses fault data derived from these documents

## Related Decisions
- [ADR-0004 Spark Structured Streaming with checkpointed offsets](../../history/adrs/0004-spark-checkpointing.md)
- [ADR-0002 Polyglot persistence](../../history/adrs/0002-polyglot-persistence.md)
- [ADR-0001 Kappa streaming architecture](../../history/adrs/0001-kappa-architecture.md)

## Operational Notes
Critical flow — the status half of ingestion. Watch `spark.query.running`, `kafka.topic.lag` for `acme.ev.status`, and `db.write.errors`. Recovery: re-submit the pipeline (resumes from checkpoint). Full metrics and runbooks: [Observability](../../operations/observability.md), [Operations Guide](../../operations/operations-guide.md).

## Reading Path
1. **Overview** — this file.
2. [Sequence](sequence.md).
3. [Components](components.md).
4. [Persistence Context](persistence.md).
5. [Contract Usage](contract-usage.md).
6. [Installation](installation.md).

## Traceability
- Project brief deliverable P2 — "Ingesta de datos de Estado" (IoT → Kafka → Spark → MongoDB); see [References](../../knowledge/references.md).
