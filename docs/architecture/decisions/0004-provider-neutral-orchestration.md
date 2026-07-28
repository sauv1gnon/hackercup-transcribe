# ADR-0004: Provider-neutral orchestration

- **Status:** Accepted
- **Date:** 2026-07-29

## Context

Google has the strongest fit for the initial translation and OCR deployment. OpenAI has a distinct
educational-transformation role. Qwen-MT may add Waray later. SDK request and error shapes differ,
and provider support does not prove classroom quality.

## Decision

Application use cases call capability ports. Infrastructure adapters own SDKs, authentication,
timeouts, response validation, and provider-error translation. The backend accepts internal provider
selection as `auto`; normal teachers do not select providers.

Google Translation provides faithful translation, Google Vision provides OCR, and OpenAI provides
structured educational transformation in their owning phases. Qwen-MT remains stretch scope. Release
labels come from human evaluation, not provider support.

## Consequences

- Provider changes remain local to infrastructure and composition.
- Domain and transport contracts avoid SDK types.
- Adapter contract tests and explicit failure mappings are required.
- Routing adds small orchestration overhead but avoids UI/provider coupling.
