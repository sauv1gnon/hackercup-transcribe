# SalinAral

SalinAral is a teacher-facing lesson-localisation workspace for Philippine classrooms. It turns
English or Filipino learning material into an editable teaching pack containing a faithful
translation, a grade-appropriate explanation, a glossary, and comprehension questions in a selected
Philippine language.

The teacher remains responsible for reviewing every generated output. SalinAral is an auxiliary
linguistic-scaffolding tool, not a replacement medium of instruction, an automated teacher, or a
claim of Department of Education approval.

## Current state

**Phase 3 is complete and remains the current gated state. Phase 4 has not started.**

The implemented workspace accepts teacher-entered text or one validated JPEG, PNG, or WebP image.
Image bytes are decoded and sanitized in memory, Google Vision extracts a transient OCR draft, and
the teacher reviews that text before requesting localisation and educational output. All generated
material is an AI-assisted draft—review before classroom use. See
[delivery status](docs/delivery/status.json), the [roadmap](docs/delivery/roadmap.md), and
[Phase 3 evidence](docs/delivery/phase-3-evidence.md).

## Start here

1. Read [`AGENTS.md`](AGENTS.md).
2. Read the [product specification](docs/product/product-spec.md).
3. Read the [architecture](docs/architecture/architecture.md).
4. Inspect the [OpenAPI contract](specs/openapi.yaml).
5. Confirm the [active delivery phase](docs/delivery/status.json).

The original research and recommendation brief remains in
[`Hackercup Transcribe.md`](Hackercup%20Transcribe.md). It is source material, not the executable
contract.

## Local setup

Use Node.js 24.18.0, as pinned in `.nvmrc` and `.node-version`. No credentials are needed for the
deterministic quality checks.

```sh
npm ci
npm run check
```

The repository does not use dotenv files. Future credentials must arrive from the runtime
environment or a managed secret store. Google Cloud workloads should use Application Default
Credentials backed by a least-privilege service account.

## Useful commands

| Command                | Purpose                                           |
| ---------------------- | ------------------------------------------------- |
| `npm run check`        | Run every deterministic repository quality gate   |
| `npm test`             | Run contract and implementation tests             |
| `npm run spec:lint`    | Validate the OpenAPI document                     |
| `npm run phase:check`  | Reject phase leakage and dotenv files             |
| `npm run secrets:scan` | Scan tracked project content for likely secrets   |
| `npm run format`       | Apply repository formatting                       |
| `npm run audit`        | Query npm for high-severity dependency advisories |

## Repository map

```text
apps/            API and teacher-facing web application
packages/        Domain, application, contract, and infrastructure modules
specs/           Machine-readable API, module, runtime, and evaluation contracts
docs/            Product, architecture, delivery, security, quality, and AI-agent context
scripts/         Repository policy checks
tests/           Executable acceptance and contract checks
```
