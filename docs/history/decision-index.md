# Decision Index

Every architectural decision, indexed. Full records live in [`adrs/`](adrs/).

| ADR | Title | Status | Scope | Related flows | Date |
|-----|-------|--------|-------|---------------|------|
| [0001](adrs/0001-kappa-architecture.md) | Kappa streaming architecture | Accepted | System | Ingest GPS, Ingest Status | 2026-06-10 |
| [0002](adrs/0002-polyglot-persistence.md) | Polyglot persistence (PostgreSQL + MongoDB) | Accepted | System | Ingest GPS, Ingest Status, Query GPS Events, Query Status Events | 2026-06-10 |
| [0003](adrs/0003-kafka-kraft-broker.md) | Kafka in KRaft mode as the streaming backbone | Accepted | System | Produce Telemetry, Ingest GPS, Ingest Status | 2026-06-11 |
| [0004](adrs/0004-spark-checkpointing.md) | Spark Structured Streaming with checkpointed offsets | Accepted | Flow | Ingest GPS, Ingest Status | 2026-06-12 |
| [0005](adrs/0005-jwt-rbac-data-scoping.md) | Stateless JWT auth with role-based data scoping | Accepted | System | Login, Query GPS Events, Query Status Events, List Vehicles | 2026-06-15 |
| [0006](adrs/0006-cqrs-backend.md) | CQRS structure in the backend | Accepted | System | Login, Query GPS Events, Claim Vehicle, Query Status Events | 2026-06-15 |
| [0007](adrs/0007-managed-cloud-databases.md) | Managed cloud databases via URI swap (Supabase + Atlas) | Accepted | System | Ingest GPS, Ingest Status | 2026-06-18 |

Status values: Proposed, Accepted, Deprecated, Superseded by ADR-XXXX. Scope values: System or Flow. Sorted by ADR number.
