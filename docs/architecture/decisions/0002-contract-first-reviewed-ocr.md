# ADR-0002: Contract-first API and reviewed OCR

- **Status:** Accepted
- **Date:** 2026-07-29

## Context

The source brief includes both a combined image-localization endpoint and a workflow in which the
teacher corrects OCR before translation. Automatically translating unreviewed OCR can change
decimals, signs, formulas, names, and scientific terminology.

## Decision

Define the HTTP surface in OpenAPI before route implementation. Use separate operations:

- `POST /api/v1/ocr/extractions` extracts transient text from one image; and
- `POST /api/v1/localisations` localizes teacher-reviewed plain text.

The browser owns the editable handoff between them. Errors use stable problem documents. Shared
transport schemas will be derived from or kept in lockstep with OpenAPI.

## Consequences

- The teacher visibly controls the most error-sensitive transition.
- OCR and localization can be tested, timed, and rate-limited independently.
- The browser performs two requests for the image journey.
- A future combined endpoint would be a new contract decision, not a hidden shortcut.
