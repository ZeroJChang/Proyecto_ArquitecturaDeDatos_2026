# Runbook: Ingestion backlog

**Purpose:** Restore ingestion throughput when the stream falls behind real time but is not erroring.

## Symptoms

`kafka.topic.lag` climbing; `ingestion.lag_seconds` p99 over a minute; data appears stale in the API but no errors are raised.

## Safety and prerequisites

Non-destructive. Scaling Spark workers does not touch committed offsets or stored data. No data-loss risk.

## Diagnosis

```bash
# Is the broker healthy and are topics present?
docker exec -it broker /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server broker:9092 --list

# Topic end-offsets reveal production rate (Spark tracks its own offsets via checkpoints)
docker exec -it broker /opt/kafka/bin/kafka-run-class.sh \
  kafka.tools.GetOffsetShell --broker-list broker:9092 --topic acme.ev.gps

# Are Spark workers registered and the query progressing?
docker logs spark-master --tail 50
```

The streaming UI (`:4040`) shows batch duration; a batch duration above the trigger interval means workers are under-resourced.

## Remediation

```bash
# Scale workers by raising worker count/memory in compose, then recreate:
docker compose up -d --scale spark-worker-1=1 spark-worker-2=1
```

If production rate exceeds processing capacity sustainably, add Kafka partitions and Spark workers per the scaling plan in the [High-Level Design](../../hld.md).

## Validation

`kafka.topic.lag` flattens toward zero and `ingestion.lag_seconds` p99 returns under 60s. New rows/documents appear at the live rate.

## Rollback

If workers were over-provisioned, scale back during a quiet window. Non-urgent; reducing workers is safe.

## Escalation

Page the Data on-call if lag keeps rising for >30 min after scaling.

## Related

- [Observability](../observability.md) → `kafka.topic.lag`, `ingestion.lag_seconds`
- Flows: [Ingest GPS](../../flows/ingest-gps/index.md), [Ingest Status](../../flows/ingest-status/index.md)
- [Operations Guide](../operations-guide.md)
