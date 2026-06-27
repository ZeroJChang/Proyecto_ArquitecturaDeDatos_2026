# Start Here

ACME EV Data Platform ingests real-time telemetry (GPS position and operational status) from a fleet of electric vehicles, processes it as a stream, and exposes it through a role-based API and dashboards for administrators, branch operators, and vehicle owners.

For the full system vision, read [`hld.md`](hld.md).

## Read by your objective

| I want to… | Go to |
|------------|-------|
| Understand what the system does and how it fits together | [`hld.md`](hld.md) |
| Find a specific flow or browse all flows | [`flow-map.md`](flow-map.md) |
| See which external systems we depend on | [`integration-map.md`](integration-map.md) |
| Understand why a decision was made | [`decision-index.md`](decision-index.md) |
| Operate, monitor, or troubleshoot the system | [`operations-guide.md`](operations-guide.md), [`observability.md`](observability.md) |
| Look up a business term | [`glossary.md`](glossary.md) |
| Find an external spec, ticket, or runbook link | [`references.md`](references.md) |

## New to the project?

1. Read [`hld.md`](hld.md) for the system vision and architecture.
2. Skim [`flow-map.md`](flow-map.md) to see the business capabilities.
3. Open the flow you'll work on under [`flows/`](flows/).

## What kind of system is this?

This is a **Kappa-style streaming platform**: every datum flows through one streaming pipeline (Kafka → Spark Structured Streaming → datastore), with no separate batch layer. The reasoning behind that choice is in [ADR-0001](adrs/0001-kappa-architecture.md). Storage is **polyglot**: PostgreSQL for relational entities and GPS events, MongoDB for the flexible status events ([ADR-0002](adrs/0002-polyglot-persistence.md)).
