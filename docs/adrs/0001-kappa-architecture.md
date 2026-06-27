# ADR-0001: Kappa streaming architecture

**Status:** Accepted
**Date:** 2026-06-10
**Scope:** System
**Related Flows:** Ingest GPS, Ingest Status

## Context

Vehicles emit telemetry continuously (GPS and operational status). The platform must store and serve this data with low latency. We had to choose an overall data-processing architecture before building the ingestion pipelines.

## Decision

Adopt a **Kappa architecture**: a single streaming pipeline (Kafka → Spark Structured Streaming → datastore) handles all data. There is no separate batch layer. The nature of the data — periodic, continuous telemetry — maps naturally onto stream processing, and a single processing path removes the duplication a batch layer would add.

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| Kappa (streaming only) — **chosen** | One pipeline and one codebase; immediate consistency; natural fit for continuous telemetry | No native large-scale historical reprocessing layer; replay means re-streaming from Kafka/storage |
| Lambda (batch + speed layers) | Powerful batch reprocessing; tolerant of late/large historical recomputation | Two pipelines with duplicated logic; eventual consistency between layers; more to operate — overkill for periodic IoT frames |
| Direct DB writes (no stream processor) | Simplest to build | No buffering or backpressure; tight coupling of producers to datastores; loses replay and exactly-once guarantees |

## Trade-offs

We gain a simpler, unified pipeline and immediate availability of ingested data. We give up a purpose-built batch reprocessing layer; if a full historical recompute is ever needed, it is done by replaying the stream rather than running a separate batch job.

## Consequences

- Operational: one streaming system to monitor (the Spark pipelines), not two.
- All ingestion logic lives in [Ingest GPS](../flows/ingest-gps/) and [Ingest Status](../flows/ingest-status/).
- Reprocessing depends on Kafka retention and source data, not a batch store.

## Future Considerations

Revisit if the business needs heavy ad-hoc historical analytics that the serving stores cannot satisfy — at that point a downstream warehouse fed from the same stream (still Kappa-compatible) is preferable to reintroducing a Lambda batch layer.
