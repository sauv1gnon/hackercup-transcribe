# ADR-0001: Clean-architecture npm monorepo

- **Status:** Accepted
- **Date:** 2026-07-29

## Context

SalinAral must combine a browser, an HTTP API, multiple translation providers, OCR, and educational
generation during a short hackathon. Provider capabilities and exact models can change faster than
teacher-facing behavior. Future agents need obvious ownership and dependency rules.

## Decision

Use one npm workspace repository with two application boundaries and four backend/shared modules:
`web`, `api`, `domain`, `application`, `contracts`, and `infrastructure`.

Dependencies point inward as defined in `specs/module-boundaries.json`. Domain and application code
remain framework- and provider-independent. The API is the server composition root; the web
application consumes only versioned transport contracts.

Phase 0 reserves these directories with documentation but does not create React, Fastify, or
TypeScript product workspaces.

## Consequences

- Provider adapters can be replaced without rewriting use cases or UI behavior.
- Contract drift and forbidden dependencies can be checked automatically.
- There are more explicit mapping points than in a single application folder.
- Cross-cutting convenience imports are intentionally constrained.
- Workspace implementation and build orchestration begin in Phase 1.
