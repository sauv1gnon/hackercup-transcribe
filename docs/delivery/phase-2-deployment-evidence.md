# Phase 2 deployment evidence

**Date:** 2026-07-29  
**Project:** `omskrt`  
**Region:** `asia-southeast1`  
**Status:** Complete

## Build evidence

| Image                | Cloud Build ID                         | Digest prefix     | Result  |
| -------------------- | -------------------------------------- | ----------------- | ------- |
| API `api:phase2`     | `19846f30-2c08-4dc2-a273-cab9513f6c15` | `sha256:2a02f732` | Success |
| Website `web:phase2` | `faba9873-c2c1-4eb1-bba6-aa8099ac5b05` | `sha256:45a92faf` | Success |

Both images were built from the checked Phase 2 workspace and published to the existing
`asia-southeast1` Artifact Registry repository.

## Published services

| Service | Address                                                      | Ready revision            |
| ------- | ------------------------------------------------------------ | ------------------------- |
| API     | `https://salinaral-api-362467836118.asia-southeast1.run.app` | `salinaral-api-00002-sx9` |
| Website | `https://salinaral-web-362467836118.asia-southeast1.run.app` | `salinaral-web-00003-k7b` |

Both services run the `phase2` image and serve 100 percent of traffic. The previous Phase 1
revisions remain available as the rollback path.

## Secret and identity evidence

- Secret Manager is enabled.
- `salinaral-openai-api-key` has an enabled version.
- Only `salinaral-api@omskrt.iam.gserviceaccount.com` received `roles/secretmanager.secretAccessor`
  on that secret.
- Cloud Run mounts the latest version as `OPENAI_API_KEY`; no value was printed, written to the
  repository, placed in an image, or exposed to the browser.
- Google Translation continues to use the same workload service account and Application Default
  Credentials.

## Live checks

- Health returned `ok`.
- A translation-only request returned a non-empty Google translation, `ai_generated` review status,
  and no education-provider provenance.
- A complete-pack request returned HTTP 200 with faithful translation, simplified explanation, a
  non-empty glossary, and three to five questions covering recall, explanation, and application.
- Complete-pack provenance reported Google translation and OpenAI educational transformation.
- The approved website origin received its matching access-control header.
- The website and its runtime configuration returned HTTP 200 and pointed to the published API.
- A query of the new API revision logs found no occurrence of the synthetic lesson marker.

No lesson text or generated content is recorded in this evidence.

## Phase exit

The deployed API proved a complete schema-valid teaching pack, and the checked production web build
contains controlled editing inputs for every generated section. Phase 2 is complete.

Phase 4 still owns preservation warnings, copy and print actions, formal accessibility acceptance,
demonstration samples, and fluent-speaker evaluation. No classroom-accuracy or learner-outcome claim
is made.
