# Phase 0 completion checklist

The status file may mark Phase 0 complete only when all items below are true.

## Product and contracts

- [x] Product behavior uses stable requirement IDs.
- [x] Acceptance journeys cover success, unsafe input, preservation, and provider failure.
- [x] OpenAPI describes the planned versioned surface and stable problem responses.
- [x] Runtime configuration names contain no values or defaults.
- [x] Module dependency direction is machine-readable.
- [x] Evaluation record shape and release criteria are specified.

## Engineering foundation

- [x] Node and npm expectations are pinned.
- [x] JavaScript quality artifacts are installed and locked.
- [x] Formatting, linting, type checking, tests, API linting, phase checks, and secret scanning run
      from one command.
- [x] Application and package directories communicate ownership without containing implementation.
- [x] CI uses `npm ci` and the same quality command.

## Agent context

- [x] Root agent instructions define read order and document precedence.
- [x] The active phase is machine-readable.
- [x] The work loop starts with a requirement, contract, and failing check.
- [x] Module ownership and handoff expectations are explicit.

## Security

- [x] Dotenv and committed credential files are forbidden.
- [x] Runtime injection and Google service-account identity are documented.
- [x] Content-free logging and stateless processing are invariants.
- [x] Upload, CORS, rate-limit, error, and provider-boundary requirements are specified.
- [x] Dependency audit has no known high or critical advisory.

## Exit evidence

- [x] `npm ci` succeeds from the lockfile.
- [x] `npm run check` succeeds.
- [x] `npm run audit` succeeds at the configured threshold.
- [x] Repository review finds no Phase 1 implementation and no secret material.

These final evidence boxes are checked only after the commands and review actually complete.
