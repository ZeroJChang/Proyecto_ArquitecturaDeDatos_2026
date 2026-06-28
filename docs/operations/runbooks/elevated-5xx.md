# Runbook: Elevated 5xx

**Purpose:** Bring the API server-error rate back within its SLO.

## Symptoms

The `api-5xx-rate` alert fires; users report errors loading dashboards or telemetry.

## Safety and prerequisites

Rolling back to a previous image tag is reversible. Recreating the service causes a brief request interruption; the backend is stateless so no data is at risk.

## Diagnosis

```bash
# Recent backend errors
docker logs acme-ev-backend --tail 200 | grep -i error

# Confirm DB connectivity from the backend
docker exec -it acme-ev-backend sh -c "nc -zv postgres 5432"
docker exec -it acme-ev-backend sh -c "nc -zv mongo 27017"
```

## Remediation

If errors correlate with a recent deploy, roll back to the previous image tag and recreate the service. If they correlate with a datastore, follow the [Datastore outage](datastore-outage.md) runbook instead.

```bash
docker compose up -d --force-recreate backend-service
```

## Validation

`api.5xx` rate returns under the SLO; dashboards and telemetry endpoints load. Confirm error-budget burn has stopped.

## Rollback

Once the underlying fix ships, redeploy the newer image tag and recreate the service.

## Escalation

Page the API on-call; declare an incident if the error-budget burn is rapid.

## Related

- [Observability](../observability.md) → SLOs and error-budget policy
- [Operations Guide](../operations-guide.md)
