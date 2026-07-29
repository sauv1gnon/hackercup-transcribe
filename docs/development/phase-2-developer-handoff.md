# Phase 2 developer handoff

Phase 2 adds complete educational output to the existing localisation request. The API translates
with Google first and calls OpenAI only when an educational section is requested. The web
application requests all four output kinds and keeps teacher edits in browser memory.

## Current deployment

- Project: `omskrt`
- Region: `asia-southeast1`
- Website: `https://salinaral-web-362467836118.asia-southeast1.run.app`
- API: `https://salinaral-api-362467836118.asia-southeast1.run.app`
- API revision: `salinaral-api-00002-sx9`
- Website revision: `salinaral-web-00003-k7b`

## Runtime requirements

Keep the Phase 1 server settings and inject `OPENAI_API_KEY` into the API process at runtime. Never
write it to this repository, a dotenv file, a command argument, or browser configuration.

For Cloud Run, use the Secret Manager secret named `salinaral-openai-api-key` and grant
`salinaral-api@omskrt.iam.gserviceaccount.com` access to that secret only. The API service mounts
the latest secret version as `OPENAI_API_KEY`.

The educational adapter uses `gpt-5.6-luna`, disables OpenAI response storage, performs no automatic
retry, and has a 30-second provider deadline. A complete request may take longer than a
translation-only request because the providers run sequentially.

## Local run

Supply `OPENAI_API_KEY` through the launching shell or an approved secret tool, then use the Phase 1
Google Application Default Credentials and runtime settings:

```powershell
$env:NODE_ENV = "development"
$env:PORT = "3000"
$env:LOG_LEVEL = "info"
$env:CORS_ALLOWED_ORIGINS = "http://localhost:5173"
$env:GOOGLE_CLOUD_PROJECT = gcloud config get-value project
$env:GOOGLE_CLOUD_LOCATION = "global"
npm run dev:api
```

Start the web workspace separately with `npm run dev:web`. Use only short synthetic lesson text
without student or private information for live provider checks.

## Expected behavior

- `outputs: ["translation"]` does not call OpenAI.
- Any requested educational output performs one structured OpenAI call.
- The response includes only requested optional sections.
- The web application requests translation, simplified explanation, glossary, and questions.
- Every generated result remains labeled **AI-assisted draft—review before classroom use.**
- Teacher edits are local and change the displayed state to teacher edited; no content is persisted.
