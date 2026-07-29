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

## Expected behavior

- A valid image returns extracted text with `reviewRequired: true`.
- A mismatched, malformed, oversized, or excessive-dimension image fails before the provider call.
- The image filename is not used for storage or OCR content.
- OCR and localisation remain separate requests; the teacher can edit extracted text first.
- Provider failures return stable, redacted problem responses.
- Image bytes and OCR text are not persisted or logged.

The current repository work does not deploy Phase 3. Before a public release, enable the Vision API
in the target project and run one representative, non-private worksheet through the existing staging
process.
