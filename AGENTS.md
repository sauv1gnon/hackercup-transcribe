# AI agent operating guide

This file is the default instruction set for every agent working in this repository. Keep it current
whenever architecture, scope, commands, or delivery state changes.

## Mission and language

Build SalinAral as a stateless, teacher-facing lesson-localisation workspace. Use **Philippine
languages** or **regional languages**, not “dialects.” Describe generated material as an
**AI-assisted draft—review before classroom use**. Never imply guaranteed accuracy, official
verification, improved learner outcomes without a study, or Department of Education approval.

## Read order and authority

Before changing code or contracts, read:

1. `docs/delivery/status.json` for the active phase.
2. `docs/product/product-spec.md` for product behavior and requirement IDs.
3. `docs/architecture/architecture.md` and accepted ADRs for structure.
4. `specs/openapi.yaml` for HTTP behavior.
5. `specs/module-boundaries.json` for dependency direction.
6. `specs/runtime-configuration.json` and `docs/security/security-baseline.md` for runtime safety.
7. The relevant module `README.md`.

When documents conflict, use this precedence:

1. The user’s current explicit instruction.
2. Accepted ADRs.
3. Machine-readable contracts.
4. Product specification.
5. Original `Hackercup Transcribe.md` research brief.

Do not silently resolve a material conflict. Record the decision in an ADR and update every affected
contract in the same change.

## Phase gate

The active phase is machine-readable in `docs/delivery/status.json`. Do not implement work assigned
to a later phase. `npm run phase:check` enforces the Phase 0 boundary.

Phase 0 permits specifications, decisions, documentation, repository tooling, contract tests, and
empty module ownership placeholders. It forbids application source, UI, API routes, provider
adapters, deployment, and product behavior. Opening Phase 1 requires an explicit user decision and
an atomic update to delivery status.

## Spec-driven work loop

For each independently verifiable unit:

1. Identify the requirement ID and active phase.
2. Write or amend the acceptance case and contract first.
3. Capture the failing test or check.
4. Implement only the smallest owning-module change.
5. Run focused checks, then `npm run check`.
6. Review privacy, provider failure, malformed input, and boundary cases.
7. Update delivery status and traceability only when the exit condition is proven.

If behavior has no requirement or acceptance case, stop and specify it before coding.

## Dependency direction

| Module           | May depend on                                          |
| ---------------- | ------------------------------------------------------ |
| `domain`         | Nothing internal; no frameworks or provider SDKs       |
| `application`    | `domain`                                               |
| `contracts`      | Nothing internal                                       |
| `infrastructure` | `application`, `domain`                                |
| `api`            | `contracts`, `application`, `domain`, `infrastructure` |
| `web`            | `contracts`                                            |

Provider SDK types must not leak through application ports. The API and provider adapters map their
own errors to stable application or transport errors. Composition roots select concrete adapters;
use cases never do.

## Security and privacy invariants

- Never create `.env`, `.env.*`, credential JSON, key, certificate, or token files.
- Never hardcode or commit secret values, including examples that resemble live keys.
- Obtain secrets only through runtime injection or managed secret stores. Keep secrets server-only.
- Prefer Cloud Run service-account identity and Application Default Credentials for Google APIs.
- Never prefix a secret with `VITE_` or otherwise expose it to browser bundles.
- Never log lesson text, OCR text, translations, generated teaching packs, prompts, uploaded image
  bytes, authorization headers, or provider payloads.
- Log allowlisted metadata only: request ID, operation, duration, result category, provider alias,
  language codes, grade, subject, byte or character counts, and warning codes.
- Keep the MVP stateless. Uploaded bytes remain in memory only and are discarded after the request.
- Validate unknown input at the transport boundary. Validate image signature as well as declared
  MIME type, size, dimensions, and count.
- Escape generated text through normal React rendering. Do not render provider output as raw HTML.
- Use strict CORS, security headers, request limits, timeouts, and rate limits before exposing an
  expensive endpoint.
- Return generic client errors and retain diagnostic details only in redacted server logs.

## TypeScript and test conventions

- Use strict TypeScript; do not use `any`, non-null assertions, enums, or unchecked casts.
- Prefer immutable values, small pure functions, explicit error types, and dependency injection.
- Keep framework code thin. Business decisions belong in domain or application modules.
- Test behavior through ports with deterministic fakes. Provider contract tests may use recorded,
  sanitized fixtures; live-provider tests must be opt-in and must never run in default CI.
- A change is not complete until formatting, lint, types, tests, contract linting, secret scanning,
  and phase checks pass.

## Required handoff

State the requirement IDs changed, files or modules owned, checks run, unresolved risks, and the
next phase-safe task. Never mark a phase complete because files exist; prove its exit condition.
