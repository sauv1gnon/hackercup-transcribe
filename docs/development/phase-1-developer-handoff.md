# Phase 1 developer handoff

This handoff is for the person who will connect SalinAral to Google Cloud and publish it. The text
workspace and both Cloud Run services are now published. Phase 1 is still in progress until the
remaining language and acceptance checks are recorded.

## Current deployment

- Google Cloud project: `omskrt`
- Region: `asia-southeast1`
- Website: `https://salinaral-web-362467836118.asia-southeast1.run.app`
- API: `https://salinaral-api-362467836118.asia-southeast1.run.app`
- API identity: `salinaral-api@omskrt.iam.gserviceaccount.com`

The deployment was checked on 2026-07-29. Health and language discovery returned successfully, the
website received the final API address, an English-to-Cebuano translation returned an AI-generated
draft, and an unapproved website origin received no browser access header. The full record is in
`docs/delivery/phase-1-deployment-evidence.md`.

## What is ready

- Teachers can choose English or Filipino as the source.
- Teachers can choose Filipino, Cebuano, or Hiligaynon as the target.
- The page accepts plain lesson text and shows the source beside the translation.
- Every result says **AI-assisted draft—review before classroom use**.
- Lesson text stays in the request and is not written to a database or application log.
- The API uses the Google identity attached to the running service. It does not need a downloaded
  key file.

## Try it on this computer

From PowerShell, sign in for local Google access:

```powershell
gcloud auth application-default login
```

This sign-in is kept by Google outside the repository. Do not download a service-account key and do
not create an `.env` file.

In one PowerShell window, set the non-secret values for this process and start the API:

```powershell
$env:NODE_ENV = "development"
$env:PORT = "3000"
$env:LOG_LEVEL = "info"
$env:CORS_ALLOWED_ORIGINS = "http://localhost:5173"
$env:GOOGLE_CLOUD_PROJECT = gcloud config get-value project
$env:GOOGLE_CLOUD_LOCATION = "global"
npm run dev:api
```

In a second PowerShell window:

```powershell
npm run dev:web
```

Open `http://localhost:5173`. Use a short lesson that contains no student name or private record.
The first live request may create a Google Cloud charge.

## Prepare the Google Cloud project

Check the project shown by this command:

```powershell
gcloud config list
```

If it is wrong, stop and select the approved project. When it is correct, enable the services used
for translation, building, and publishing:

```powershell
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com translate.googleapis.com
```

Create the image repository once:

```powershell
gcloud artifacts repositories create salinaral --repository-format=docker --location=asia-southeast1 --description="SalinAral service images"
```

Create a dedicated identity for the API and give it permission to translate text:

```powershell
$projectId = gcloud config get-value project
$apiIdentity = "salinaral-api@$projectId.iam.gserviceaccount.com"
gcloud iam service-accounts create salinaral-api --display-name="SalinAral API"
gcloud projects add-iam-policy-binding $projectId --member="serviceAccount:$apiIdentity" --role="roles/cloudtranslate.user"
```

Do not grant Owner or Editor access to this identity.

## Repeat the build and publication

Build both service images:

```powershell
gcloud builds submit --config cloudbuild.api.yaml .
gcloud builds submit --config cloudbuild.web.yaml .
```

Publish the website first with a temporary API address so its final address becomes known:

```powershell
$projectId = gcloud config get-value project
$region = "asia-southeast1"
$webImage = "$region-docker.pkg.dev/$projectId/salinaral/web:phase1"
gcloud run deploy salinaral-web --image $webImage --region $region --allow-unauthenticated --set-env-vars "PUBLIC_API_BASE_URL=https://not-ready.invalid"
$webUrl = gcloud run services describe salinaral-web --region $region --format="value(status.url)"
```

Now publish the API and allow only that website address:

```powershell
$apiImage = "$region-docker.pkg.dev/$projectId/salinaral/api:phase1"
$apiIdentity = "salinaral-api@$projectId.iam.gserviceaccount.com"
$apiSettings = "NODE_ENV=production,LOG_LEVEL=info,CORS_ALLOWED_ORIGINS=$webUrl,GOOGLE_CLOUD_PROJECT=$projectId,GOOGLE_CLOUD_LOCATION=global"
gcloud run deploy salinaral-api --image $apiImage --region $region --allow-unauthenticated --service-account $apiIdentity --set-env-vars $apiSettings
$apiUrl = gcloud run services describe salinaral-api --region $region --format="value(status.url)"
gcloud run services update salinaral-web --region $region --update-env-vars "PUBLIC_API_BASE_URL=$apiUrl"
```

Cloud Run supplies the listening port automatically. Do not add `GOOGLE_APPLICATION_CREDENTIALS`, an
API key, or a key-file path.

## Final human checks

1. Open `$apiUrl/api/v1/health`; it should report `ok`.
2. Open `$apiUrl/api/v1/languages`; English, Filipino, Cebuano, and Hiligaynon should appear.
3. Open the website and translate one short, non-private lesson into Cebuano.
4. Repeat with Hiligaynon. Treat both as early support and review the wording with a fluent speaker.
5. Check the API logs. They may show language, grade, subject, size, timing, and result category.
   They must not show the lesson or translation.
6. Confirm that an unapproved website cannot call the API.
7. Set a practical Google Cloud budget alert and Translation quota before sharing the public link.

Do not mark Phase 1 complete yet. Completion also needs the remaining focused acceptance evidence
listed in `docs/delivery/phase-1-task-map.md`.

## Official help

- [Cloud Translation access roles](https://docs.cloud.google.com/translate/docs/access-control)
- [Cloud Run service settings](https://docs.cloud.google.com/run/docs/configuring)
- [Cloud Run environment values](https://cloud.google.com/run/docs/configuring/services/environment-variables)
