# SalinAral architecture

**Status:** Accepted Phase 0 baseline  
**Decision scope:** MVP through hackathon completion

## Architectural goals

The architecture must keep the teacher workflow easy to change while provider integrations, model
behavior, and deployment details evolve independently. It must also make unsafe data retention and
secret handling difficult to introduce accidentally.

The governing rule is:

> Source dependencies point inward. Domain and application policy never import HTTP, React, cloud,
> provider SDK, or deployment types.

## System context

The planned system has two deployable applications:

- a React web application used by the teacher; and
- a Fastify HTTP API deployed as a stateless Cloud Run service.

The API will call external capabilities through provider-neutral ports:

- Google Cloud Translation Advanced for primary translation;
- Google Cloud Vision for OCR;
- OpenAI for structured educational transformation; and
- Qwen-MT only as an optional Waray or provider-fallback extension.

There is no application database or durable content storage in the MVP.

## Module ownership

| Module                    | Owns                                                  | Must not own                                |
| ------------------------- | ----------------------------------------------------- | ------------------------------------------- |
| `packages/domain`         | Values, entities, invariants, warnings, review states | Frameworks, schemas tied to HTTP, SDKs      |
| `packages/application`    | Use cases, ports, policies, orchestration             | HTTP, UI, provider SDKs, environment access |
| `packages/contracts`      | Versioned request/response schemas and public types   | Business policy, provider types             |
| `packages/infrastructure` | Provider adapters, runtime config, safe logging       | Teacher workflow or domain decisions        |
| `apps/api`                | Fastify routes, transport mapping, composition root   | Business rules, direct provider decisions   |
| `apps/web`                | Teacher interaction, local editing state, API client  | Secrets, provider SDKs, backend internals   |

The machine-readable form is `specs/module-boundaries.json`.

## Dependency graph

Allowed internal dependencies are:

```text
web -> contracts

api -> contracts
api -> application
api -> domain
api -> infrastructure

infrastructure -> application
infrastructure -> domain

application -> domain

contracts -> none
domain -> none
```

Circular dependencies are forbidden. Shared code is not a reason to create a generic `utils` module;
place behavior with the concept that owns it.

## Planned package structure

The directories are ownership targets, not Phase 0 implementation:

```text
apps/
  api/                 HTTP presentation and composition root
  web/                 React presentation
packages/
  domain/              Provider-independent business concepts
  application/         Use cases and ports
  contracts/           Versioned transport schemas
  infrastructure/      External adapters and runtime concerns
```

Each workspace will receive its own `package.json`, TypeScript configuration, tests, and public
entrypoint when its owning phase begins. Product code is not added during Phase 0.

## Planned request flows

### Text localization

1. The web application sends a contract-valid text request.
2. The API validates unknown input and maps it to an application command.
3. The application use case validates policy and selects a provider capability through a port.
4. Infrastructure translates the source and maps the provider result to a neutral result.
5. Preservation checks compare protected tokens.
6. The educational adapter receives the source and translation and returns schema-valid output.
7. The API maps the result to the OpenAPI response without logging content.

### Reviewed image extraction

1. The API rejects excess parts and streams one bounded image into memory.
2. Infrastructure confirms file signature and decoded dimensions.
3. The OCR adapter extracts transient text and review cues.
4. The API returns extraction data, then releases all image references.
5. The teacher corrects the text in the browser.
6. The corrected text follows the normal text-localization flow.

OCR and localization intentionally use separate endpoints. This prevents an extraction error from
silently becoming instructional content.

## Ports

Application ports will express SalinAral concepts rather than SDK types. The initial boundaries are:

```ts
interface TranslationProvider {
  supports(source: LanguageCode, target: LanguageCode): boolean;
  translate(request: TranslationRequest): Promise<TranslationResult>;
}

interface OcrProvider {
  extractText(input: OcrInput): Promise<OcrResult>;
}

interface EducationAdapter {
  buildTeachingPack(input: TeachingPackInput): Promise<TeachingPack>;
}

interface OperationalLogger {
  record(event: OperationalEvent): void;
}
```

These signatures are illustrative until their Phase 1 or later contract tests define exact domain
types. SDK response objects, HTTP status codes, and environment variables never appear in them.

## Transport contract

`specs/openapi.yaml` is authoritative for HTTP paths, payloads, limits, and stable errors. The
planned API uses `/api/v1` and RFC 9457-style `application/problem+json` errors.

Transport schemas are mapped at the API boundary:

- HTTP input is `unknown` until validated.
- Contract DTOs do not double as domain entities.
- Application errors map to stable problem types.
- Provider names may appear as bounded provenance metadata but provider payloads never do.
- A breaking HTTP change requires a versioned path or an accepted migration decision.

## Runtime configuration

Infrastructure reads a validated projection of runtime variables once at the composition root. No
inner module reads `process.env`. The expected variable names and exposure rules are in
`specs/runtime-configuration.json`.

Secret values have no repository defaults. Cloud Run injects them at runtime from Secret Manager;
Google APIs use the workload service account through Application Default Credentials. Browser
configuration is explicitly public and cannot contain keys.

## Data and logging

Content lifetime is request-scoped:

```text
request body -> validated in-memory value -> provider call -> response -> released
```

No source lesson, image, OCR text, translation, prompt, or teaching pack is persisted or logged.
Logging uses a typed allowlist so arbitrary objects and error instances cannot be serialized by
default.

Request IDs are generated at ingress and forwarded to provider calls where supported. They support
operational debugging without content.

## Failure model

Application errors will distinguish at least:

- invalid request;
- unsupported language pair;
- input too large;
- unsafe image;
- provider timeout;
- provider unavailable or quota exhausted;
- invalid provider response; and
- unexpected internal failure.

The API maps these to contract-defined problem responses. Provider failures may be retried only when
the operation is safe, within a strict deadline, and likely transient. Retries must not multiply
cost unboundedly.

Partial educational output is rejected unless a future contract explicitly supports partial results.
Returning a structurally valid but invented fallback is forbidden.

## Security boundaries

The public internet, browser input, uploaded bytes, provider responses, and runtime variables are
all untrusted boundaries. Controls are specified in `docs/security/security-baseline.md`.

The API composition root is responsible for:

- body and multipart limits before allocation;
- validation and normalization;
- CORS and security headers;
- rate limiting and timeouts;
- safe problem mapping;
- cancellation propagation; and
- dependency construction from validated runtime configuration.

## Deployment shape

The planned frontend and API are separate Cloud Run services built into Artifact Registry. The API
service account receives only the provider permissions it needs. Production frontend origin values
are runtime configuration; wildcard production CORS is forbidden.

Deployment manifests, containers, and live Cloud Run services belong to Phase 1. None exist in
Phase 0.

## Change rules

- New behavior starts with a requirement and acceptance case.
- New external systems require a port, adapter, failure mapping, and ADR.
- New cross-module dependencies require an update to the machine-readable boundary contract.
- New runtime variable names require contract and security-review updates.
- New persistence requires a privacy, retention, deletion, and threat-model decision before code.
