# Security policy

SalinAral will process teacher-supplied learning material and images. Treat that content as
sensitive even when it is not intended to contain personal information.

## Reporting

Do not open a public issue for a suspected vulnerability or exposed credential. Contact the
repository owner privately or use the repository host’s private vulnerability-reporting feature.
Include impact, reproduction steps, affected revision, and a safe proof of concept. Do not include
real student or teacher data.

## Repository policy

- Secret values and credential files are prohibited.
- Dotenv files are prohibited, including local-only variants and examples.
- Production secrets must be stored in a managed secret store and injected at runtime.
- Google Cloud access should use a least-privilege service account and Application Default
  Credentials rather than a downloaded service-account key.
- Dependency lockfiles are required and CI uses `npm ci`.
- Suspected leaked credentials must be revoked and rotated; deleting the file is not sufficient.

## Data policy

The MVP is stateless. It does not persist source text, extracted OCR text, translations, teaching
packs, uploaded images, or provider prompts. Logs contain allowlisted operational metadata only.
Users are warned not to submit student names, grades, identifiers, addresses, or records.

The complete implementation checklist is in
[`docs/security/security-baseline.md`](docs/security/security-baseline.md).
