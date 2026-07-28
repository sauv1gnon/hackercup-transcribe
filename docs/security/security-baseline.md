# Security and privacy baseline

**Status:** Mandatory for the MVP  
**Review trigger:** Any new input, endpoint, provider, runtime variable, log field, persistence, or
deployment change

## Security objectives

1. Prevent teacher content and uploaded images from being retained or exposed.
2. Keep all provider credentials server-only and out of repository files and browser builds.
3. Bound cost and resource consumption from unauthenticated public requests.
4. Treat provider output as untrusted and prevent it from becoming executable content.
5. Preserve enough content-free telemetry to diagnose availability and cost.

## Trust boundaries

The following are untrusted:

- browser requests and all teacher-entered values;
- filenames, MIME types, image bytes, and decoded image metadata;
- proxy headers unless the deployment explicitly establishes a trusted proxy;
- provider responses, structured-output strings, and SDK errors;
- process environment values; and
- generated text rendered by the browser.

Validation occurs when data crosses each boundary, even if another layer already validated it.

## Content classification and lifetime

| Data                                           | Classification              | Allowed lifetime                    | Logging   |
| ---------------------------------------------- | --------------------------- | ----------------------------------- | --------- |
| Lesson source text                             | Sensitive content           | One request                         | Forbidden |
| Uploaded image bytes                           | Sensitive content           | One OCR request in memory           | Forbidden |
| OCR text and confidence spans                  | Sensitive content           | Request and browser editing session | Forbidden |
| Translation and teaching pack                  | Sensitive generated content | Request and browser editing session | Forbidden |
| Provider prompt and response                   | Sensitive content           | One provider call                   | Forbidden |
| Request ID and timing                          | Operational metadata        | Log-retention window                | Allowed   |
| Language, grade, subject, sizes, warning codes | Operational metadata        | Log-retention window                | Allowed   |
| Credential or authorization data               | Secret                      | Runtime need only                   | Forbidden |

The MVP does not persist content. Browser editing state should remain in memory; persistent browser
storage requires a later privacy decision.

## Secret management

- `.env`, `.env.*`, dotenv examples, credential JSON, private keys, and tokens are forbidden.
- Repository documentation records variable names and purpose only.
- Cloud Run secrets are injected at runtime from Secret Manager.
- Google clients use the Cloud Run service account through Application Default Credentials.
- Local Google access uses user-level Application Default Credentials outside this repository.
- Local non-Google provider keys may be injected into the process by the developer’s shell or an
  approved secret tool. They must not be written to project files or command history.
- Secret variables are read only by the server composition root or infrastructure configuration
  module.
- A missing required secret fails the relevant capability safely; error output names the missing
  variable but never a value.
- No secret may use a `VITE_` prefix or appear in a client-side build argument.

The complete name and exposure manifest is `specs/runtime-configuration.json`.

## Text input controls

- Parse the body under an explicit byte limit.
- Validate the request schema before use.
- Normalize line endings and trim exterior whitespace while preserving paragraphs.
- Reject empty text and more than 20,000 Unicode characters.
- Treat URLs, formulas, measurements, names, and code-like text as content to preserve, not
  instructions to execute.
- Do not interpolate teacher content into a system message or provider policy instruction.
- Use structured provider input fields and delimit untrusted content.

Prompt injection cannot grant tools, network access, storage, or policy changes to the educational
adapter. The adapter’s only output is a validated teaching-pack structure.

## Image upload controls

Apply controls before an OCR provider call:

1. Accept exactly one multipart file field.
2. Cap the complete request and file at 5 MiB before buffering.
3. Allow declared JPEG, PNG, or WebP only.
4. Detect file signature from bytes and require it to match an allowed type.
5. Decode through a maintained image library with resource limits.
6. Reject width or height above 4,000 pixels and malformed images.
7. Ignore the filename for storage because no file is written.
8. Remove metadata before forwarding when the provider path would otherwise transmit it.
9. Hold only a request-scoped memory buffer and release references in `finally`.
10. Apply a strict timeout and cancellation signal.

SVG, GIF, PDF, archives, office documents, and executables are rejected in the MVP.

## Provider controls

- Pin supported SDK versions through the lockfile.
- Use a provider-specific adapter with an application-level timeout.
- Restrict Google service-account roles to the exact APIs required.
- Validate provider response structure, required fields, text lengths, and allowed enum values.
- Reject invalid or incomplete educational output; do not fabricate missing sections.
- Strip SDK error objects to a stable internal error category.
- Do not retry validation, authentication, quota, or unsupported-language errors.
- Bound transient retries by count, elapsed deadline, and request cancellation.
- Never send source content to more providers than the selected operation requires.
- Record the provider alias and outcome category, not its payload.

## HTTP protections

Before public deployment:

- enforce HTTPS at the platform edge;
- use Helmet with a tested Content Security Policy;
- allow only the deployed frontend origin in production CORS;
- reject credentialed wildcard CORS;
- cap JSON, multipart, and response sizes;
- set request and provider deadlines;
- rate-limit all `/api` operations by trusted client IP;
- use stricter cost limits for localization and OCR;
- disable detailed framework errors in production;
- validate `Content-Type` and return `415` for unsupported media;
- return `429` with a bounded `Retry-After` when limited; and
- avoid exposing framework or provider version headers.

Rate-limit values are deployment configuration and need load/cost evidence before Phase 1 release.

## Safe output and browser controls

- Render all source and generated content as React text nodes.
- Do not use `dangerouslySetInnerHTML` for provider or teacher content.
- Do not interpret Markdown from a provider unless a future sanitizer decision is accepted.
- Keep a strict CSP; do not add broad `unsafe-inline` or `unsafe-eval` exceptions without review.
- Do not place secrets or content in URLs, query strings, analytics events, or error trackers.
- Copy, print, and download operate on teacher-visible state only.

## Logging allowlist

An operational event may contain only:

- timestamp;
- severity;
- service and version;
- request ID and trace correlation;
- operation;
- duration;
- result category and HTTP status;
- provider alias;
- source and target language codes;
- grade and subject;
- character or byte counts;
- warning codes; and
- retry count.

Logger APIs should accept typed operational events, not arbitrary objects. Error messages, stack
traces, headers, bodies, prompts, image metadata, and provider responses require explicit redaction
and must never reach client responses.

## Stable error behavior

Errors use `application/problem+json` and include a safe type, title, status, detail, and request
ID. The detail is predefined or constructed only from validated non-sensitive metadata. Provider
names may be omitted from public errors to avoid coupling.

Internal diagnostic errors preserve cause chains in memory but are serialized only through the
logging allowlist.

## Dependency and supply-chain controls

- Commit `package-lock.json`.
- CI installs with `npm ci`, never an unpinned install.
- Run `npm audit --audit-level=high` in CI and before deployment.
- Use Dependabot for lockfile updates.
- Review install scripts and transitive changes for image, cloud, and AI SDK upgrades.
- Build images from a pinned Node LTS line.
- Do not download executable build artifacts from ad hoc URLs.

## Security acceptance cases

| ID      | Evidence required before relevant release                                        |
| ------- | -------------------------------------------------------------------------------- |
| SEC-001 | Secret scanner and repository walk find no secret or dotenv file                 |
| SEC-002 | Content fields are absent from captured logs for success and failure             |
| SEC-003 | Oversized, mismatched, malformed, and excessive-dimension images fail before OCR |
| SEC-004 | Provider error and invalid JSON return stable redacted problems                  |
| SEC-005 | Production CORS rejects an unapproved origin                                     |
| SEC-006 | Expensive endpoints return `429` under configured abuse threshold                |
| SEC-007 | Generated HTML-like strings render as inert text                                 |
| SEC-008 | Request cancellation ends downstream provider work when supported                |
| SEC-009 | Cloud Run identity works without a service-account key file                      |

## Pre-deployment review

- [ ] All implemented security acceptance cases pass.
- [ ] Runtime variables match the manifest and contain no client-side secret.
- [ ] Secret Manager versions and service-account roles are reviewed.
- [ ] Production origins, timeouts, body limits, and rate limits are explicit.
- [ ] Logs are sampled for content leakage under success and failure.
- [ ] Error responses contain no stack, SDK message, header, body, or credential.
- [ ] npm has no unresolved high or critical advisory.
- [ ] Provider quotas and a kill switch are available.
- [ ] The teacher warning against uploading student records is visible.
- [ ] No content persistence or third-party analytics was added.
