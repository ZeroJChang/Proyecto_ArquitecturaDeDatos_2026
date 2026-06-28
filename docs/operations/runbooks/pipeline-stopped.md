# Runbook: Pipeline stopped

**Purpose:** Bring a stopped Spark streaming query back online without losing or duplicating committed frames.

## Symptoms

`spark.query.running` = 0 for a pipeline; the ingestion counter is flat; no new rows in `gps_events` / `status_events`.

## Safety and prerequisites

Re-submitting resumes from the last committed checkpoint, so no committed frame is reprocessed or lost ([ADR-0004](../../history/adrs/0004-spark-checkpointing.md)). **Do not delete the checkpoint** — see the [Corrupt checkpoint](corrupt-checkpoint.md) runbook for that guarded action.

## Diagnosis

```bash
# Check master + worker logs for the failed query
docker logs spark-master --tail 100
docker logs spark-worker-1 --tail 100

# Confirm the datastore the pipeline writes to is reachable
docker exec -it spark-master sh -c "nc -zv postgres 5432"
docker exec -it spark-master sh -c "nc -zv mongo 27017"
```

## Remediation

Re-submit the affected pipeline.

```bash
# GPS -> PostgreSQL
docker exec -it spark-master /opt/spark/bin/spark-submit \
  --master spark://spark-master:7077 \
  --conf spark.jars.ivy=/tmp/.ivy2 \
  --conf spark.driver.extraClassPath=/tmp/.ivy2/jars/org.postgresql_postgresql-42.7.3.jar \
  --conf spark.executor.extraClassPath=/tmp/.ivy2/jars/org.postgresql_postgresql-42.7.3.jar \
  --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.1,org.postgresql:postgresql:42.7.3 \
  /opt/spark/jobs/pipelines/process_gps_stream.py

# Status -> MongoDB
docker exec -it spark-master /opt/spark/bin/spark-submit \
  --master spark://spark-master:7077 \
  --conf spark.jars.ivy=/tmp/.ivy2 \
  --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.1,org.mongodb.spark:mongo-spark-connector_2.12:10.4.0 \
  /opt/spark/jobs/pipelines/process_status_stream.py
```

## Validation

`spark.query.running` returns to 1 for the pipeline and the ingestion counter resumes; confirm new rows/documents are landing.

## Rollback

Not applicable — restarting the query is the recovery. If the query crashes again immediately, do not loop re-submits; escalate.

## Escalation

Page the Data on-call if the query crashes again immediately after restart (likely a poison frame or schema mismatch).

## Related

- [Observability](../observability.md) → `spark.query.running`
- [ADR-0004](../../history/adrs/0004-spark-checkpointing.md)
- [Operations Guide](../operations-guide.md)
