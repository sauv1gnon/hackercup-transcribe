# Contributing

SalinAral uses small, spec-driven changes so a hackathon team and AI agents can work quickly without
losing architectural control.

## Setup

1. Install Node.js 24.18.0.
2. Run `npm ci`.
3. Run `npm run check` before making changes.

Phase 0 needs no cloud account or credential. Do not create a dotenv file.

## Before implementation

- Confirm the active phase in `docs/delivery/status.json`.
- Name the product requirement or non-functional requirement being changed.
- Update acceptance cases and machine-readable contracts before implementation.
- Read the owning module’s `README.md` and dependency rules.
- Keep one dominant risk per change.

## Pull request expectations

A pull request should:

- stay within the active phase;
- reference requirement and decision IDs;
- contain focused tests or explain why a document-only change needs none;
- update OpenAPI and shared contracts together;
- document new runtime variable names without values;
- disclose privacy, security, provider, and rollout considerations;
- pass `npm run check` and `npm run audit`.

Generated outputs and provider responses must never be committed as fixtures unless they are
synthetic, sanitized, and clearly labeled.

## Commit hygiene

Keep unrelated work out of the same commit. Suggested scopes are `spec`, `domain`, `application`,
`contracts`, `api`, `web`, `infrastructure`, `security`, `test`, and `tooling`.
