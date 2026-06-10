# ADR 0001: Start With a Modular Monolith

## Status

Accepted

## Context

Atlasmed needs a backend that supports healthcare CRM, territory management, workflows, notifications, analytics, admin governance, and an AI assistant. The platform has multiple domains, but the initial team benefits from simpler deployment, faster iteration, and a shared TypeScript codebase.

## Decision

Start with a modular monolith using TypeScript, Bun, ElysiaJS, PostgreSQL, and Redis. Enforce clear domain boundaries through module structure, domain services, explicit interfaces, and event-driven side effects.

## Rationale

This reduces infrastructure complexity while preserving a path to split domains later if scaling, team topology, or compliance requirements justify it.

## Consequences

- Domain boundaries must be intentionally maintained from the start.
- Cross-domain access should happen through explicit interfaces or events, not direct data coupling.
- Observability and audit logging must be treated as platform concerns from the beginning.
