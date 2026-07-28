# Phase 1 task map

**Status:** Planning only. Phase 1 has not started.

This map decomposes the next phase into independently verifiable units. It does not authorize any
unit while `status.json` keeps Phase 1 closed.

## Opening procedure

An explicit user decision opens Phase 1. In the same change:

1. set `currentPhase` to `1`;
2. mark Phase 0 complete and Phase 1 in progress;
3. replace the temporary Phase 0 “no implementation” test with Phase 1 capability tests; and
4. create workspace manifests only for the first owning task.

Resolve current compatible dependency versions when the phase opens. Do not install the entire
future stack speculatively.

## Ordered units

### P1-01 — Workspace build skeleton

- **Owner:** repository tooling, `api`, `web`, and required packages
- **Requirements:** NFR-009, NFR-010
- **Risk:** build/runtime module resolution
- **Done:** empty React/Vite and Fastify TypeScript entrypoints build and test without a feature

### P1-02 — Contract type pipeline

- **Owner:** `contracts`
- **Requirements:** FR-002, NFR-004, NFR-009
- **Risk:** drift between OpenAPI and runtime validation
- **Done:** request/response schemas and generated or derived types match OpenAPI in CI

### P1-03 — Language and translation domain

- **Owner:** `domain`
- **Requirements:** FR-002, FR-008, NFR-005
- **Risk:** leaking provider concepts inward
- **Done:** language pair, request, result, warning, and status invariants pass pure unit tests

### P1-04 — Translation application port and use case

- **Owner:** `application`
- **Requirements:** FR-003, NFR-007
- **Risk:** orchestration and stable failures
- **Done:** deterministic fake-provider tests cover success, unsupported pair, timeout, and invalid
  result

### P1-05 — Operational and language routes

- **Owner:** `api`
- **Requirements:** FR-008, NFR-002, NFR-006
- **Risk:** transport/security defaults
- **Done:** in-process tests prove health, languages, request ID, headers, CORS, and content-free
  logs

### P1-06 — Google Translation adapter

- **Owner:** `infrastructure`
- **Requirements:** FR-003, NFR-003, NFR-007
- **Risk:** identity, SDK mapping, quota, and content leakage
- **Done:** adapter contract tests pass with a fake client; an opt-in smoke test uses Application
  Default Credentials

### P1-07 — Text localization route

- **Owner:** `api`
- **Requirements:** FR-002, FR-003, FR-007
- **Risk:** validation and error mapping
- **Done:** `translation`-only OpenAPI examples pass in-process tests; limits and stable failures
  are proven

### P1-08 — Teacher text workspace

- **Owner:** `web`
- **Requirements:** FR-001, FR-002, FR-003, NFR-008
- **Risk:** clear, accessible interaction and escaped rendering
- **Done:** a teacher can select context, submit text, compare the translation, and see the review
  warning

### P1-09 — Cloud Run deployment

- **Owner:** deployment
- **Requirements:** NFR-003, NFR-006, NFR-010
- **Risk:** runtime identity, CORS, and rollback
- **Done:** deployed frontend/API pass health and translation smoke tests with Secret
  Manager/workload identity and no credential file

## Phase exit

Complete Phase 1 only when English, Filipino, Cebuano, and one approved additional language work
through the deployed text path and the exit evidence described in `roadmap.md` is recorded.
