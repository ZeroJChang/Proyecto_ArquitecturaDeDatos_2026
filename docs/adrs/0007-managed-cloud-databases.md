# ADR-0007: Managed cloud databases via URI swap (Supabase + Atlas)

**Status:** Accepted
**Date:** 2026-06-18
**Scope:** System
**Related Flows:** Ingest GPS, Ingest Status

## Context

Local development runs PostgreSQL and MongoDB as containers, but production needs high availability, backups, and point-in-time recovery without the team operating database infrastructure. We wanted production-grade durability with minimal code change between environments.

## Decision

Target **Supabase** (managed PostgreSQL) and **MongoDB Atlas** in production, selected purely by swapping `POSTGRES_URI` / `MONGO_URI` in the single root `.env`. Two compose files express the split: `compose.yml` includes local database containers; `compose.prod.yml` omits them and points the app and Spark at the managed endpoints. No application code differs between environments.

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| Managed Supabase + Atlas via URI swap — **chosen** | HA, backups, and PITR out of the box; near-zero code difference; less ops burden | Vendor dependency; cost at scale; network egress to cloud |
| Self-hosted DBs in production | Full control; no vendor lock-in | Team must run HA, backups, patching, and failover — significant ops cost |
| Cloud-provider-native DBs (RDS + DocumentDB) | Deep cloud integration | Heavier setup; more lock-in to one cloud; overkill for this project's scope |

## Trade-offs

We gain managed durability (PITR, continuous backup, multi-AZ/replica-set) and a frictionless local↔prod switch. We give up some control and accept provider dependency and cost, plus the latency of cloud network calls from Spark/back end.

## Consequences

- Connection strings, not code, are the environment boundary; `POSTGRES_URI`/`MONGO_URI` are the only switch.
- Backup/restore procedures in [`operations-guide.md`](../operations-guide.md) reference provider tooling (Supabase PITR, Atlas continuous backup).
- RTO/RPO targets in [`hld.md`](../hld.md) assume managed-service guarantees.

## Future Considerations

Re-evaluate if cost at the 5-year fleet projection outweighs the ops savings, or if data-residency requirements force a specific region/provider. The URI-swap boundary keeps a future migration low-risk.
