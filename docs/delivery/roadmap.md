# Delivery roadmap

Delivery state is authoritative in `status.json`. A later phase does not start implicitly when an
earlier phase is complete.

## Phase 0 — Specification and project foundation

**Status:** Complete. Phase 1 remains closed.

**Purpose:** make implementation deterministic, modular, secure, and efficient for a human/AI
hackathon team.

Deliverables:

- normative product requirements and acceptance journeys;
- machine-readable OpenAPI, module-boundary, runtime-configuration, and evaluation contracts;
- clean-architecture ownership boundaries;
- accepted architecture decisions;
- runtime-secret, privacy, and input-safety policy;
- pinned JavaScript quality tooling and a reproducible lockfile;
- automated checks for formatting, linting, types, contracts, phase leakage, and likely secrets;
- AI-agent read order, work loop, and handoff format; and
- CI and dependency-update automation.

Exit condition:

> A fresh clone can run `npm ci` and `npm run check`; every Phase 1 task has an owning module,
> requirement, contract, acceptance case, and security constraint; no Phase 1 behavior exists.

## Phase 1 — Text translation foundation

**Status:** Complete.

Planned work:

- initialize React/Vite and Node.js/Fastify TypeScript workspaces;
- implement domain language and translation concepts;
- implement application ports and text-translation use case;
- add health and language endpoints;
- integrate Google Cloud Translation behind its port;
- build the minimal text-input teacher workspace; and
- prepare Cloud Run deployment without embedding credentials.

Exit condition:

> A teacher can translate text between English, Filipino, Cebuano, and one additional approved
> language through the deployed system.

## Phase 2 — Educational output

**Status:** Complete.

Implement grade and subject context, structured educational transformation, complete teaching-pack
output, result editing, and provider-output validation.

Exit condition:

> One corrected text input produces a complete, editable, schema-valid teaching pack.

## Phase 3 — Image modality

**Status:** Not started.

Implement image validation, in-memory OCR, teacher correction, and the handoff to the existing text
pipeline.

Exit condition:

> A photographed worksheet produces editable extracted text and, after review, localized content.

## Phase 4 — Trust and demonstration

**Status:** Not started.

Implement sample lessons, copy and print, review warnings, preservation checks, accessibility
acceptance, fluent-speaker evaluation, and a reliable demo narrative.

Exit condition:

> The demo tells the complete teacher story without manual repair or unsupported accuracy claims.

## Stretch

**Status:** Not started.

Qwen-MT for Waray, internal provider comparison, feedback categorization, and printable worksheet
formatting may begin only after Phase 4 exit evidence is recorded.
