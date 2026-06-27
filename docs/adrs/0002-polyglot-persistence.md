# ADR-0002: Polyglot persistence (PostgreSQL + MongoDB)

**Status:** Accepted
**Date:** 2026-06-10
**Scope:** System
**Related Flows:** Ingest GPS, Ingest Status, Query GPS Events, Query Status Events

## Context

The platform stores two very different kinds of data: relational entities (branches, users, vehicles, ownership) plus GPS events with a fixed schema; and operational status events whose future shape is uncertain — the requirements state that future vehicle models will send additional, currently-unknown attributes.

## Decision

Use **two datastores, each matched to its data**:

- **PostgreSQL** for relational entities and `gps_events`. GPS rows have a fixed schema and need joins with `vehicles`/`vehicle_owners` for access scoping and integrity.
- **MongoDB** for `status_events`. A document model absorbs future status fields without migrations.

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| PostgreSQL + MongoDB — **chosen** | Each engine fits its data; flexible status schema; relational integrity for entities/GPS | Two systems to operate, back up, and reason about |
| PostgreSQL only (JSONB for status) | One engine; JSONB gives some flexibility | Schema evolution and high-volume document writes are clumsier than a native document store; mixes concerns |
| MongoDB only | One engine; flexible everywhere | Loses relational integrity, joins, and transactional guarantees needed for ownership/scoping |

## Trade-offs

We gain a natural fit for both data shapes and a future-proof status schema. We give up operational simplicity: there are two databases to provision, monitor, and back up (reflected in [`operations-guide.md`](../operations-guide.md)).

## Consequences

- GPS ingestion writes via JDBC to PostgreSQL ([Ingest GPS](../flows/ingest-gps/)); status ingestion writes via the Mongo Spark connector ([Ingest Status](../flows/ingest-status/)).
- Access scoping for GPS leans on relational joins; status scoping resolves VINs from PostgreSQL first, then queries MongoDB.
- Backup strategy differs per store — see [`operations-guide.md`](../operations-guide.md).

## Future Considerations

If status data later stabilizes into a fixed schema and join needs grow, consolidating onto PostgreSQL could be reconsidered. Conversely, a third store (e.g. a time-series DB) may be warranted if telemetry query patterns become heavily time-window oriented.
