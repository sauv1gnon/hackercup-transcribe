# ADR-0003: Stateless processing and runtime-only secrets

- **Status:** Accepted
- **Date:** 2026-07-29

## Context

Teacher inputs may accidentally contain student information. The MVP does not need saved lessons,
accounts, or asynchronous document processing. Provider credentials must not be copied into source,
browser bundles, local files, images, or build layers.

## Decision

Process lesson content and uploaded images only in request memory. Do not add a database, content
cache, queue, or Cloud Storage to the MVP. Log allowlisted operational metadata and never log
content or provider payloads.

For configuration:

- dotenv files and committed credential files are prohibited;
- server secrets are injected at runtime from a managed secret store;
- Google Cloud uses a least-privilege workload service account and Application Default Credentials;
  and
- browser-exposed configuration is explicitly public and contains no provider secret.

The configuration-name contract is `specs/runtime-configuration.json`.

## Consequences

- Privacy, deletion, and hackathon operations are simpler.
- A service restart loses in-flight content, which is acceptable for synchronous MVP requests.
- Saved lessons, batches, and asynchronous OCR require a new retention and storage decision.
- Local provider development relies on runtime shell injection or user-level cloud credentials, not
  repository files.
