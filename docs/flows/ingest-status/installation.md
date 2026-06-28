# Ingest Status — Installation

Flow-specific local setup beyond the system-wide bring-up in [`hld.md`](../../hld.md). Run this after Kafka and MongoDB are up and the producer is publishing.

## Prerequisites

- Kafka broker reachable, topic `acme.ev.status` receiving frames (start [Produce Telemetry](../produce-telemetry/)).
- MongoDB reachable; the `status_events` collection is created on first write.
- `PYTHONPATH=/opt/spark/jobs` inside the Spark containers (set by the image).

## Environment

Read by `common/config.py`: `KAFKA_BROKER`, `KAFKA_TOPIC_STATUS`, `MONGO_URI`, `MONGO_DB`, `MONGO_COLLECTION_STATUS`, `SPARK_CHECKPOINT_DIR`. Checkpoint resolves to `/opt/spark/work-dir/checkpoints/acme-ev-status`.

## Submit the pipeline

```bash
docker exec -it spark-master /opt/spark/bin/spark-submit \
  --master spark://spark-master:7077 \
  --conf spark.jars.ivy=/tmp/.ivy2 \
  --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.1,org.mongodb.spark:mongo-spark-connector_2.12:10.4.0 \
  /opt/spark/jobs/pipelines/process_status_stream.py
```

## Verify

```bash
# Documents landing in MongoDB
docker exec -it mongo mongosh --quiet --eval "db.getSiblingDB('acme').status_events.countDocuments()"
```

## Reset checkpoint (last resort)

Clearing the checkpoint can skip/replay frames — see the [Corrupt checkpoint runbook](../../operations/runbooks/corrupt-checkpoint.md).

```bash
docker exec -it spark-master rm -rf /opt/spark/work-dir/checkpoints/acme-ev-status
```

---

[Previous: Contract Usage](contract-usage.md) · [Flow Index](index.md)
