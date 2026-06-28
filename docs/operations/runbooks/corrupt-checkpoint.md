# Runbook: Corrupt checkpoint

**Purpose:** Recover a pipeline that refuses to start because its Spark checkpoint is corrupt.

## Symptoms

A pipeline refuses to start, logging a checkpoint/offset error after an unclean shutdown.

## Safety and prerequisites

> **Destructive.** Deleting a checkpoint makes the pipeline restart from the topic's `latest`/`earliest` offset depending on config, which can **skip or replay** frames. Confirm the data impact first, and in production get sign-off from the Data owner before clearing. This is a last resort — first confirm the checkpoint is genuinely unrecoverable.

## Diagnosis

```bash
docker exec -it spark-master ls -la /opt/spark/work-dir/checkpoints/acme-ev-gps
docker logs spark-master --tail 100
```

## Remediation

```bash
# Last resort — clears committed-offset state for the GPS pipeline
docker exec -it spark-master rm -rf /opt/spark/work-dir/checkpoints/acme-ev-gps
```

Then re-submit the pipeline following the [Pipeline stopped](pipeline-stopped.md) runbook.

## Validation

The pipeline starts and the streaming query reaches `running`; rows/documents resume landing. Cross-check ingestion counts against the topic to assess any skip/replay impact.

## Rollback

None — checkpoint deletion is irreversible. Record the potential data gap or duplication window for follow-up reconciliation.

## Escalation

Get sign-off from the Data owner before clearing a checkpoint in production — it is a potential data-loss action.

## Related

- [ADR-0004](../../history/adrs/0004-spark-checkpointing.md)
- Flows: [Ingest GPS](../../flows/ingest-gps/index.md), [Ingest Status](../../flows/ingest-status/index.md)
- [Operations Guide](../operations-guide.md)
