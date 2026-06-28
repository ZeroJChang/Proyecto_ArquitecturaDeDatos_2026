# ADR-0004: Spark Structured Streaming with checkpointed offsets

**Status:** Accepted
**Date:** 2026-06-12
**Scope:** Flow
**Related Flows:** Ingest GPS, Ingest Status

## Context

The ingestion pipelines must not lose or silently duplicate committed frames when a pipeline restarts (deploy, crash, datastore blip). We need a processing model that tracks exactly which Kafka offsets have been durably written downstream.

## Decision

Process both streams with **Spark Structured Streaming using `foreachBatch` and a per-pipeline `checkpointLocation`**. Each pipeline keeps its committed Kafka offsets under a unique checkpoint directory (`/opt/spark/work-dir/checkpoints/acme-ev-gps` and `.../acme-ev-status`). An offset is committed only after its micro-batch write succeeds, so a restart resumes from the last committed offset.

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| Structured Streaming + checkpoints — **chosen** | Resume-without-loss; `foreachBatch` allows custom JDBC/Mongo sinks; native Kafka offset management | Checkpoint state can corrupt on unclean shutdown (see runbook) |
| Spark with manual offset tracking | Full control over offset storage | Reinvents what checkpointing already provides; error-prone |
| Kafka consumer + custom writer (no Spark) | Lighter footprint | Lose Spark's batch/transform model and connectors; must build retry/scaling/parsing ourselves |

## Trade-offs

We gain at-least-once delivery with idempotent restart from a known offset, and the freedom to write to PostgreSQL and MongoDB via custom batch functions. We give up the ability to casually delete checkpoint state — clearing it can skip or replay frames, so it is a guarded, last-resort action.

## Consequences

- Each pipeline must own a unique checkpoint path; sharing one would corrupt offset tracking.
- Writers early-return on empty batches to avoid no-op writes.
- A corrupt checkpoint is an operational scenario with its own [runbook](../../operations/runbooks/corrupt-checkpoint.md).

## Future Considerations

If end-to-end exactly-once into the sinks becomes a hard requirement, add idempotent/upsert writes keyed on a frame identity (e.g. VIN + `event_timestamp`) so replays after a partial write cannot create duplicates.
