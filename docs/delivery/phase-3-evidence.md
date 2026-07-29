# Phase 3 image-modality evidence

**Requirements:** FR-004, NFR-001, NFR-004, NFR-005, NFR-007

**Acceptance cases:** AC-002, AC-005, SEC-003

**Status:** Complete

## Implemented behavior

- `POST /api/v1/ocr/extractions` accepts one bounded multipart image separately from localisation.
- JPEG, PNG, and WebP inputs are decoded, dimension-checked, matched against the declared MIME type,
  and re-encoded without metadata before provider submission.
- Google Vision document-text detection runs behind the provider-neutral `OcrProvider` port with a
  bounded request timeout and stable failure mapping.
- OCR response data is validated against the shared contract and always requires teacher review.
- The web workspace places extracted text into the editable source field; localisation remains a
  separate teacher action.
- Original and sanitized image buffers are request-scoped and cleared after success or failure.

## Automated evidence

- `tests/phase3/image-modality.spec.ts` covers the provider-neutral extraction flow, input limits,
  decoded MIME mismatch rejection before OCR, and empty provider-output handling.
- `npm run check` covers phase gating, formatting, linting, strict types, tests, OpenAPI linting,
  and secret scanning.

Live-provider checks remain opt-in and are not part of deterministic CI. Before a public release,
confirm that the runtime service identity can call the Vision API and exercise one representative
worksheet photo; this does not change the implemented Phase 3 contract.
