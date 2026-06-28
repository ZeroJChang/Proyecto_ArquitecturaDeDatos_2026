# Runbook: Datastore outage

**Purpose:** Restore datastore availability so ingestion writes and API reads recover.

## Symptoms

`db.write.errors` rising; Spark batches failing; auth/read endpoints returning 5xx.

## Safety and prerequisites

Restarting a local container is safe. In production, provider failover and point-in-time restore are high-impact actions — confirm the provider's status page first and prefer failover over restore. Spark resumes from its checkpoint once the datastore is back, so no committed offset is lost.

## Diagnosis

```bash
# Reachability from the app + spark network
docker exec -it spark-master sh -c "nc -zv postgres 5432"
docker exec -it acme-ev-backend sh -c "nc -zv postgres 5432"
docker exec -it spark-master sh -c "nc -zv mongo 27017"

# Local DB health
docker exec -it postgres-database pg_isready -U postgres
docker exec -it mongo mongosh --eval "db.adminCommand('ping')"
```

## Remediation

```bash
# Local: restart the affected datastore container
docker compose restart postgres
docker compose restart mongo
```

In production (Supabase/Atlas), confirm provider status and trigger failover/restore from the provider console (PITR for PostgreSQL, continuous backup for MongoDB).

## Validation

`pg_isready` / `mongosh ping` succeed; `db.write.errors` stops climbing; failed batches reprocess and reads return 200.

## Rollback

Not applicable. If a production restore was performed, verify data currency against the RPO targets in the [Operations Guide](../operations-guide.md).

## Escalation

Page the DB owner immediately; declare an incident if telemetry is unqueryable for customers.

## Related

- [Observability](../observability.md) → `db.write.errors`
- [Integration Map](../../navigation/integration-map.md) → degradation behavior
- [Operations Guide](../operations-guide.md)
