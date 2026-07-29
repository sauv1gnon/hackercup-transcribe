# Phase 3 developer handoff

Phase 3 adds transient image extraction to the existing teacher workflow. The API accepts one JPEG,
PNG, or WebP image, decodes and sanitizes it in memory, calls Google Vision document-text detection,
and returns editable text without automatically localising it.

## Runtime requirements

Phase 3 adds no secret or runtime variable. It uses the existing Google Application Default
Credentials and `GOOGLE_CLOUD_PROJECT` context. The Google Cloud project must have
`vision.googleapis.com` enabled, and the API workload identity must be allowed to consume that
enabled API. Do not grant a Vision AI service-agent role to the API identity.

For local live-provider checks, use user-level Application Default Credentials outside this
repository and set their quota project:

```powershell
gcloud auth application-default login
gcloud auth application-default set-quota-project (gcloud config get-value project)
```

No credential file, API key, or dotenv file belongs in the repository. Deterministic tests use a
fake OCR port and require no Google access.

## Current deployment

| Service | Revision                  | Immutable image digest |
| ------- | ------------------------- | ---------------------- |
| API     | `salinaral-api-00003-tgl` | `sha256:cfd4faa64fba`  |
| Website | `salinaral-web-00004-p4z` | `sha256:901980c7582f`  |

Both revisions serve 100 percent of traffic in project `omskrt`, region `asia-southeast1`. The
stable service addresses remain:

- API: `https://salinaral-api-362467836118.asia-southeast1.run.app`
- Website: `https://salinaral-web-362467836118.asia-southeast1.run.app`

The complete rollout record is in `docs/delivery/phase-3-deployment-evidence.md`.

## Redeploy successful Cloud Build artifacts

This sequence does not run Cloud Build. Supply the IDs of two successful builds, resolve their
immutable digests, and deploy those exact artifacts. Resolving digests avoids ambiguity when a
rolling tag is reused by a later build.

```powershell
$projectId = "omskrt"
$region = "asia-southeast1"
$apiBuildId = "684e7227-53d4-4a79-87d6-5f195e2b5e82"
$webBuildId = "2ba49da4-8910-47a6-99c7-861495003281"

$apiStatus = gcloud builds describe $apiBuildId --project $projectId --format="value(status)"
$webStatus = gcloud builds describe $webBuildId --project $projectId --format="value(status)"
if ($apiStatus -ne "SUCCESS" -or $webStatus -ne "SUCCESS") {
  throw "Both Cloud Build jobs must be successful before redeployment."
}

$apiDigest = gcloud builds describe $apiBuildId --project $projectId --format="value(results.images[0].digest)"
$webDigest = gcloud builds describe $webBuildId --project $projectId --format="value(results.images[0].digest)"
$apiImage = "${region}-docker.pkg.dev/$projectId/salinaral/api@$apiDigest"
$webImage = "${region}-docker.pkg.dev/$projectId/salinaral/web@$webDigest"

gcloud run deploy salinaral-api --project $projectId --region $region --image $apiImage --quiet
gcloud run deploy salinaral-web --project $projectId --region $region --image $webImage --quiet
```

Deploying only a new image preserves the services' existing runtime variables, Secret Manager
binding, workload identity, scaling settings, and public access policy. Inspect the service before
and after deployment; do not add credentials to the command.

## Targeted post-deployment validation

Run the Phase 3 test file, not the full repository suite:

```powershell
npm test -- --run tests/phase3/image-modality.spec.ts
```

Then check the stable service addresses and the approved browser origin:

```powershell
$apiUrl = "https://salinaral-api-362467836118.asia-southeast1.run.app"
$webUrl = "https://salinaral-web-362467836118.asia-southeast1.run.app"

curl.exe --fail --silent --show-error "$apiUrl/api/v1/health"
curl.exe --fail --silent --show-error "$apiUrl/api/v1/languages"
curl.exe --fail --silent --show-error --output NUL $webUrl
curl.exe --fail --silent --show-error "$webUrl/config.js"
curl.exe --fail --silent --show-error --dump-header - --output NUL --header "Origin: $webUrl" "$apiUrl/api/v1/languages"
```

For the OCR check, use one synthetic or approved non-private JPEG, PNG, or WebP file:

```powershell
$testImage = "C:\path\to\synthetic-lesson.png"
curl.exe --fail --silent --show-error --form "file=@$testImage;type=image/png" "$apiUrl/api/v1/ocr/extractions"
```

Confirm a `200` response, non-empty `extractedText`, and `reviewRequired: true`. Do not copy the
lesson or OCR text into deployment evidence or logs.

## Rollback

The immediately preceding revisions remain available:

```powershell
gcloud run services update-traffic salinaral-api --project $projectId --region $region --to-revisions "salinaral-api-00002-sx9=100"
gcloud run services update-traffic salinaral-web --project $projectId --region $region --to-revisions "salinaral-web-00003-k7b=100"
```

After rollback, repeat the health, web, configuration, and CORS checks. The previous API revision
does not support the Phase 3 OCR endpoint.

## Expected behavior

- A valid image returns extracted text with `reviewRequired: true`.
- A mismatched, malformed, oversized, or excessive-dimension image fails before the provider call.
- The image filename is not used for storage or OCR content.
- OCR and localisation remain separate requests; the teacher can edit extracted text first.
- Provider failures return stable, redacted problem responses.
- Image bytes and OCR text are not persisted or logged.

Phase 3 is deployed. Before wider classroom demonstration, exercise representative non-private
worksheet photos and keep every result labeled as an AI-assisted draft—review before classroom use.
