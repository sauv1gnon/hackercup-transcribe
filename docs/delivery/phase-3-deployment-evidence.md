# Phase 3 deployment evidence

**Date:** 2026-07-29

**Project:** `omskrt`

**Region:** `asia-southeast1`

**Status:** Complete

## Build artifacts

| Service | Successful Cloud Build ID              | Immutable digest prefix |
| ------- | -------------------------------------- | ----------------------- |
| API     | `684e7227-53d4-4a79-87d6-5f195e2b5e82` | `sha256:cfd4faa64fba`   |
| Website | `2ba49da4-8910-47a6-99c7-861495003281` | `sha256:901980c7582f`   |

The deployment resolved and used the immutable digests produced by these successful builds. Cloud
Build was not rerun during redeployment.

## Published services

| Service | Ready revision            | Traffic |
| ------- | ------------------------- | ------- |
| API     | `salinaral-api-00003-tgl` | 100%    |
| Website | `salinaral-web-00004-p4z` | 100%    |

The API retained `salinaral-api@omskrt.iam.gserviceaccount.com`, its existing runtime configuration,
and its Secret Manager reference. The Vision API was enabled before rollout. The previous Phase 2
revisions remain available for rollback.

## Targeted validation

- `tests/phase3/image-modality.spec.ts`: four tests passed.
- API health returned HTTP 200 with status `ok`.
- Language discovery returned English, Filipino, Cebuano, and Hiligaynon.
- The website and runtime configuration returned HTTP 200 and the configuration referenced the
  stable API address.
- The approved website origin received its matching `Access-Control-Allow-Origin` response header.
- A generated, non-private PNG passed through the live OCR endpoint with HTTP 200, non-empty
  extracted text, and `reviewRequired: true`.
- Recent API logs contained no match for the synthetic lesson marker.
- Both services reported their new ready revision at 100 percent traffic and the expected immutable
  image digest.

No full test suite, deployment rebuild, visual check, private lesson, or classroom material was used
for this close-off.

## Public-domain rollout

On 2026-07-29, the public website `https://salinaral.alt-surf.com/` was added without removing the
Google Cloud Run website endpoint.

| Service | Ready revision                | Traffic | Immutable digest prefix |
| ------- | ----------------------------- | ------- | ----------------------- |
| API     | `salinaral-api-00004-hhr`     | 100%    | `sha256:cfd4faa64fba`   |
| Website | `salinaral-web-public-domain` | 100%    | `sha256:901980c7582f`   |

The API retained its workload identity, Secret Manager binding, image, and other runtime settings.
Its explicit CORS allowlist now contains both:

- `https://salinaral.alt-surf.com`
- `https://salinaral-web-362467836118.asia-southeast1.run.app`

The website was rolled out from the same previously verified immutable image. Its browser runtime
configuration continues to use the stable API address.

Pre-deployment `npm run check` passed all 16 tests and every formatting, linting, type, contract,
phase, and secret gate. `npm run audit` reported zero vulnerabilities. Live smoke checks proved:

- API health and language discovery returned HTTP 200;
- the public and Google Cloud Run website addresses returned HTTP 200;
- the public website served the expected API runtime configuration;
- both approved origins received their matching `Access-Control-Allow-Origin` header;
- an unapproved origin received no `Access-Control-Allow-Origin` header; and
- both new revisions were ready with 100 percent of traffic.

## Rollback

The immediate rollback targets are API revision `salinaral-api-00003-tgl` and website revision
`salinaral-web-00004-p4z`. Exact rollback commands and targeted checks are documented in
`docs/development/phase-3-developer-handoff.md`.
