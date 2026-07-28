# Phase 1 deployment evidence

**Date:** 2026-07-29  
**Project:** `omskrt`  
**Region:** `asia-southeast1`  
**Scope:** P1-09 Cloud Run deployment

## Published services

| Service | Address                                                      | Ready revision            |
| ------- | ------------------------------------------------------------ | ------------------------- |
| Website | `https://salinaral-web-362467836118.asia-southeast1.run.app` | `salinaral-web-00002-87x` |
| API     | `https://salinaral-api-362467836118.asia-southeast1.run.app` | `salinaral-api-00001-mhf` |

Both services accept public traffic. The API runs as `salinaral-api@omskrt.iam.gserviceaccount.com`,
which has the `roles/cloudtranslate.user` role. No downloaded credential file or browser secret was
used.

## Build evidence

| Image                | Cloud Build ID                         | Result  |
| -------------------- | -------------------------------------- | ------- |
| Website `web:phase1` | `3259a755-1896-4e19-b47f-39c56a8b446b` | Success |
| API `api:phase1`     | `c889db9d-8f19-497e-821e-52be73a3df08` | Success |

The website build initially failed because its workspace TypeScript file extends the repository root
`tsconfig.json`, but the container did not copy that file. Both Dockerfiles now copy the root
configuration before installing or starting workspace code.

## Live checks

- `GET /api/v1/health` returned `ok` for `salinaral-api`.
- `GET /api/v1/languages` returned `en`, `fil`, `ceb`, and `hil`.
- The website runtime configuration points to the published API address.
- The website content policy permits connections only to itself and the published API.
- An allowed-origin request returned
  `Access-Control-Allow-Origin: https://salinaral-web-362467836118.asia-southeast1.run.app`.
- A request carrying `Origin: https://example.com` received no access-control origin header.
- One short, non-private English-to-Cebuano request returned a non-empty Google translation with
  `reviewStatus: ai_generated`.

The live lesson and translated text are intentionally not recorded here.

## Remaining Phase 1 evidence

P1-09 is proven. Phase 1 remains in progress until the other task-map checks are complete and the
full deployed language path, including the approved additional language, is recorded.
