# Ingest GPS — Installation

Flow-specific local setup beyond the system-wide bring-up in [`hld.md`](../../hld.md). Run this after Kafka and PostgreSQL are up and the producer is publishing.

## Prerequisites

- Kafka broker reachable, topic `acme.ev.gps` receiving frames (start [Produce Telemetry](../produce-telemetry/)).
- PostgreSQL reachable with the `gps_events` table present.
- `PYTHONPATH=/opt/spark/jobs` inside the Spark containers (set by the image).

## Environment

Read by `common/config.py`: `KAFKA_BROKER`, `KAFKA_TOPIC_GPS`, `POSTGRES_HOST/PORT/DB/USER/PASSWORD`, `SPARK_CHECKPOINT_DIR`. Checkpoint resolves to `/opt/spark/work-dir/checkpoints/acme-ev-gps`.

## Submit the pipeline

```bash
docker exec -it spark-master /opt/spark/bin/spark-submit \
  --master spark://spark-master:7077 \
  --conf spark.jars.ivy=/tmp/.ivy2 \
  --conf spark.driver.extraClassPath=/tmp/.ivy2/jars/org.postgresql_postgresql-42.7.3.jar \
  --conf spark.executor.extraClassPath=/tmp/.ivy2/jars/org.postgresql_postgresql-42.7.3.jar \
  --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.1,org.postgresql:postgresql:42.7.3 \
  /opt/spark/jobs/pipelines/process_gps_stream.py
```

## Verify

```bash
# Rows landing in PostgreSQL
docker exec -it postgres-database psql -U postgres -d acme -c "SELECT COUNT(*) FROM gps_events;"
```

## Reset checkpoint (last resort)

Clearing the checkpoint can skip/replay frames — see the [Corrupt checkpoint runbook](../../operations/runbooks/corrupt-checkpoint.md).

```bash
docker exec -it spark-master rm -rf /opt/spark/work-dir/checkpoints/acme-ev-gps
```

---

[Previous: Contract Usage](contract-usage.md) · [Flow Index](index.md)
