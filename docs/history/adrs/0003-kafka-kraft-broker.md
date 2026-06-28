# ADR-0003: Kafka in KRaft mode as the streaming backbone

**Status:** Accepted
**Date:** 2026-06-11
**Scope:** System
**Related Flows:** Produce Telemetry, Ingest GPS, Ingest Status

## Context

The Kappa architecture ([ADR-0001](0001-kappa-architecture.md)) needs a durable, partitioned transport between the telemetry producers and the Spark pipelines. It must decouple producers from consumers, buffer bursts, and let consumers resume from a known offset after a restart.

## Decision

Use **Apache Kafka in KRaft mode** (no ZooKeeper) as the message backbone, with two topics — `acme.ev.gps` and `acme.ev.status` — at 3 partitions each. KRaft removes the ZooKeeper dependency, simplifying the single-broker local/demo deployment while keeping a clear path to a multi-broker cluster.

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| Kafka (KRaft) — **chosen** | High throughput; durable, replayable log; partitioning; no ZooKeeper; industry standard | Operational weight of a broker; single-broker demo has no replication |
| RabbitMQ | Simple, mature, good routing | Queue (not log) semantics; weaker replay/offset model for stream reprocessing |
| AWS Kinesis / managed stream | No broker to run | Vendor lock-in; cost; less control in a self-hosted Docker project |

## Trade-offs

We gain a replayable, partitioned log that underpins exactly-once-style ingestion ([ADR-0004](0004-spark-checkpointing.md)). We give up simplicity — a broker must be operated — and, in the current single-broker setup, durability against broker disk loss.

## Consequences

- The producer is the sole writer; Spark is the sole consumer ([Integration Map](../../navigation/integration-map.md)).
- Topic retention bounds how far a stopped pipeline can fall behind before frames age out.
- Current demo config uses replication factor 1; production raises it to 3.

## Future Considerations

For production scale, move to 3 brokers with replication factor 3 and 6–9 partitions per topic (see scaling plan in [High-Level Design](../../hld.md)). Reassess partition count as the fleet grows toward the 5-year projection.
