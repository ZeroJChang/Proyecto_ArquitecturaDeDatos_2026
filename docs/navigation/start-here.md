# Start Here

ACME EV Data Platform ingests real-time telemetry (GPS position and operational status) from a fleet of electric vehicles, processes it as a stream, and exposes it through a role-based API and dashboards for administrators, branch operators, and vehicle owners.

## First-Time Reading Path

1. Read the [High-Level Design](../hld.md) for the system vision and architecture.
2. Open the [Canonical Knowledge Registries](../knowledge/index.md) for shared domain, contract, and persistence knowledge.
3. Skim the [Flow Map](flow-map.md) to see the business capabilities.
4. Select a flow and follow its ordered reading path under [`flows/`](../flows/).

## Read by Objective

| I want to… | Go to |
|------------|-------|
| Understand what the system does and how it fits together | [High-Level Design](../hld.md) |
| Browse shared concepts, contracts, and the data model | [Knowledge Registries](../knowledge/index.md) |
| Find a specific flow or browse all flows | [Flow Map](flow-map.md) |
| Understand external dependencies and blast radius | [Integration Map](integration-map.md) |
| Find dashboards, logs, metrics, or alerts | [Observability](../operations/observability.md) |
| Operate, monitor, or recover the system | [Operations Guide](../operations/operations-guide.md) |
| Understand the security model | [Security](../security.md) |
| Understand why a decision was made | [Decision Index](../history/decision-index.md) |

## What Kind of System Is This?

This is a **Kappa-style streaming platform**: every datum flows through one streaming pipeline (Kafka → Spark Structured Streaming → datastore), with no separate batch layer. The reasoning is in [ADR-0001](../history/adrs/0001-kappa-architecture.md). Storage is **polyglot**: PostgreSQL for relational entities and GPS events, MongoDB for the flexible status events ([ADR-0002](../history/adrs/0002-polyglot-persistence.md)).
