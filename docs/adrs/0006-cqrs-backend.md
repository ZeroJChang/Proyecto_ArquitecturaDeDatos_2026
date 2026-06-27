# ADR-0006: CQRS structure in the backend

**Status:** Accepted
**Date:** 2026-06-15
**Scope:** System
**Related Flows:** Login, Query GPS Events, Claim Vehicle, Query Status Events

## Context

The backend is overwhelmingly read-oriented over telemetry, with a few write operations (notably claiming a vehicle). We wanted a consistent way to organize handlers that keeps reads and writes clearly separated and testable.

## Decision

Structure the backend with **CQRS via `@nestjs/cqrs`**: reads are `Query` + `QueryHandler`, writes are `Command` + `CommandHandler`, dispatched through `QueryBus`/`CommandBus`. Controllers stay thin and only translate HTTP into a query or command.

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| CQRS (`@nestjs/cqrs`) — **chosen** | Clear read/write separation; small, single-purpose handlers; easy to test in isolation | More files and ceremony per operation; mild learning curve |
| Classic service layer | Fewer files; familiar | Services tend to grow into mixed read/write god-objects; less explicit boundaries |
| Full event-sourced CQRS | Complete audit trail; temporal queries | Far more complexity than a read-mostly telemetry API needs |

## Trade-offs

We gain explicit, isolated handlers that map one-to-one to flows and are simple to unit test. We give up some boilerplate — each operation is a query/command class plus a handler — which is acceptable for the clarity it brings.

## Consequences

- Each HTTP flow corresponds to a query or command handler (e.g. `GetGpsEventsHandler`, `ClaimVehicleHandler`).
- Telemetry handlers are read-only; the only notable write is [Claim Vehicle](../flows/claim-vehicle/), which uses a command within a DB transaction.
- Controllers contain no business logic, easing the flow `components.md` documentation.

## Future Considerations

If write operations grow, consider domain events on the command side. The query side could later read from denormalized projections if telemetry read patterns demand it, without changing the controller contract.
