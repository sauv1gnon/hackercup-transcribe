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

## Rollback

The immediate rollback targets are API revision `salinaral-api-00002-sx9` and website revision
`salinaral-web-00003-k7b`. Exact rollback commands and targeted checks are documented in
`docs/development/phase-3-developer-handoff.md`.
