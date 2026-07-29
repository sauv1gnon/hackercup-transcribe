# API application boundary

Phase 3 adds the separate multipart OCR route. It validates and sanitizes one image in memory,
extracts text through Google Vision, returns a review-required draft, and releases image-buffer
references when the request ends. The existing localisation route accepts only teacher-reviewed
text.

The API may depend on `domain`, `application`, `contracts`, and `infrastructure`. Business rules
must not live here.

Runtime setup is described in `docs/development/phase-1-developer-handoff.md`. Run `npm run dev:api`
from the repository root after setting the listed process values.
