# SalinAral product specification

**Status:** Baseline for implementation  
**Version:** 0.1.0  
**Source:** Normalized from `Hackercup Transcribe.md`  
**Audience:** Product, design, engineering, quality, security, and AI agents

Normative terms **MUST**, **SHOULD**, and **MAY** follow RFC 2119 meanings.

## Product statement

Teachers in multilingual Philippine classrooms often receive learning material in English or
Filipino while some learners understand difficult concepts more readily through a regional language.
Teachers manually translate, simplify, contextualize, and assess that material.

SalinAral will let a teacher submit text or a photograph of learning material and create an
editable, grade-appropriate teaching pack in a selected Philippine language. The tool is auxiliary
linguistic scaffolding. It does not replace the teacher or prescribe a medium of instruction.

## Users and job

The primary MVP user is an elementary or junior-high-school teacher. Secondary audiences include
Alternative Learning System educators, tutors, local education programs, Indigenous Peoples
Education facilitators, and parents.

The primary job is:

> Turn one existing lesson into a reviewable explanation, glossary, and short assessment in the
> language learners understand, with less repetitive preparation work.

The MVP is teacher-facing and requires no account. It is not a student platform.

## Product principles

1. **Teacher authority:** every generated field is a draft and remains editable.
2. **Meaning before fluency:** preserve facts, names, numbers, formulas, instructions, and negation.
3. **Review before generation:** OCR text is corrected by the teacher before localization.
4. **Transparent status:** show language maturity and an AI-review label, never a fabricated
   accuracy percentage.
5. **Data minimization:** process material transiently and retain no source or generated content.
6. **Immediate value:** no registration, tutorial, or complex setup precedes the first result.
7. **Provider independence:** product behavior does not depend on a provider-specific response.

## Functional requirements

### FR-001 — Accountless teacher entry

The teacher MUST be able to use the primary workflow without registration, authentication, or a
student profile.

### FR-002 — Lesson context

Before localization, the teacher MUST select a source language, target language, grade level, and
subject. Automatic source-language detection MAY assist but MUST NOT replace the explicit choice.

The initial target set is:

| Code  | Language   | Planned MVP status |
| ----- | ---------- | ------------------ |
| `fil` | Filipino   | Stable candidate   |
| `ceb` | Cebuano    | Stable candidate   |
| `hil` | Hiligaynon | Beta candidate     |

English (`en`) and Filipino (`fil`) are initial source languages. A maturity label is a release
claim earned through the evaluation criteria, not an API-support claim.

### FR-003 — Text submission

The teacher MUST be able to paste plain text while preserving paragraph boundaries. The system MUST
reject empty input and input above the contract limit. It MUST treat all submitted text as untrusted
plain text.

### FR-004 — Reviewed image extraction

The teacher MUST be able to submit one JPEG, PNG, or WebP image. The system MUST extract text and
return it for correction before localization. OCR and localization are separate operations; the
teacher’s corrected text becomes the input to FR-003.

### FR-005 — Teaching pack

A successful localization MUST be able to return:

1. a faithful translation;
2. a grade-appropriate simplified explanation;
3. a key-term glossary containing source term, localized term, and simple explanation; and
4. three to five comprehension questions covering recall, explanation, and application.

The educational transformation MUST receive the original and translated text, use only supplied
material, and avoid introducing new facts.

### FR-006 — Teacher editing and reuse

Generated sections MUST be editable. The teacher MUST be able to compare source and result. Copy and
print actions are required for the MVP; text or printable-HTML download SHOULD be available.

### FR-007 — Review and provenance

Every generated result MUST display `AI-assisted draft—review before classroom use.` The transport
contract MUST expose a review status and warnings. Allowed review statuses are:

- `ai_generated`;
- `teacher_edited`;
- `native_speaker_reviewed`; and
- `community_verified`.

The product MUST NOT describe an unreviewed result as verified, guaranteed, certified, or approved.

### FR-008 — Language discovery

The system MUST list supported source and target languages with `experimental`, `beta`, or `stable`
status. Normal users SHOULD NOT need to choose or understand a translation provider.

### FR-009 — Preservation warnings

The system MUST compare important source and translated tokens, including numbers and measurements.
It SHOULD warn about missing names, formulas, dates, negation, and scientific terms. A warning
informs teacher review; it is not an accuracy score.

### FR-010 — Demonstration samples

The finished hackathon demo MUST offer a Grade 3 reading passage, Grade 5 science explanation, and
Grade 7 mathematics word problem without requiring the teacher to type content.

### FR-011 — Lightweight feedback

The product SHOULD let a teacher mark a result useful or needing correction and categorize the
problem as meaning, grammar, terminology, or cultural context. Stateless feedback MUST omit the
lesson and generated text.

## Non-functional requirements

### NFR-001 — Stateless content processing

The MVP MUST NOT persist source text, uploaded bytes, OCR text, translations, teaching packs, or
provider prompts. An image buffer MUST be discarded when its request ends. A database and Cloud
Storage are out of scope for the MVP.

### NFR-002 — Privacy-safe observability

Logs MUST use an allowlist and MUST NOT contain lesson content or provider payloads. Operational
metadata MAY include request ID, operation, duration, outcome category, provider alias, language
codes, grade, subject, input length, image byte count, and warning codes.

### NFR-003 — Runtime-only credentials

Secret values MUST be supplied at runtime and MUST NOT exist in source, fixtures, build arguments,
browser bundles, local dotenv files, or committed credential files. Google Cloud SHOULD use
service-account identity and Application Default Credentials.

### NFR-004 — Input limits

The initial contract limits are:

| Input                     | Limit                                         |
| ------------------------- | --------------------------------------------- |
| Text                      | 20,000 Unicode characters after normalization |
| Images per request        | 1                                             |
| Image bytes               | 5 MiB                                         |
| Image dimensions          | 4,000 by 4,000 pixels                         |
| Accepted image signatures | JPEG, PNG, WebP                               |

The server MUST verify actual file signature and decoded dimensions, not only name or declared MIME
type. SVG, executables, archives, and document formats are rejected.

### NFR-005 — Boundary validation and safe rendering

Every transport input and provider output MUST be validated against an explicit schema. Generated
text MUST use escaped text rendering. Provider output MUST NOT be injected as raw HTML.

### NFR-006 — Network protection

Before an expensive endpoint is exposed, the API MUST use strict production CORS, security headers,
body limits, request timeouts, and IP-based rate limiting. Production traffic uses HTTPS.

### NFR-007 — Failure behavior

Provider timeouts, invalid provider data, unsupported languages, quota exhaustion, and partial
results MUST map to stable problem responses. Client errors MUST not contain provider secrets,
payloads, stack traces, or internal exception messages.

### NFR-008 — Accessibility and device support

The completed web experience MUST support keyboard use, semantic labels, visible focus, large touch
targets, readable type, and phone-sized layouts. Accessibility is a functional acceptance concern,
not a final polish task.

### NFR-009 — Contract compatibility

HTTP behavior is authoritative in `specs/openapi.yaml`. Breaking contract changes require a new API
version or an accepted migration ADR. Domain and application modules MUST remain unaware of HTTP and
cloud SDK types.

### NFR-010 — Reproducible quality

The committed lockfile and pinned runtime MUST reproduce formatting, linting, type checking, tests,
contract validation, phase validation, and secret scanning through `npm run check`.

## Core domain vocabulary

| Concept                 | Meaning                                                       |
| ----------------------- | ------------------------------------------------------------- |
| `Language`              | Provider-independent language identity and release status     |
| `LessonContext`         | Source, target, grade, and subject selected by the teacher    |
| `TranslationRequest`    | Validated plain source text and lesson context                |
| `TranslationResult`     | Faithful translated text plus provider-neutral warnings       |
| `OcrExtraction`         | Transient extracted text and review cues, not durable content |
| `TeachingPack`          | Translation, simplified explanation, glossary, and questions  |
| `GlossaryEntry`         | Source term, localized term, and simple explanation           |
| `ComprehensionQuestion` | Recall, explanation, or application prompt                    |
| `TranslationWarning`    | A review cue for potentially changed or missing content       |
| `ReviewStatus`          | Human-review maturity of one generated output                 |

## Provider responsibility

| Capability                 | Preferred MVP provider                      | Boundary              |
| -------------------------- | ------------------------------------------- | --------------------- |
| Faithful translation       | Google Cloud Translation Advanced           | `TranslationProvider` |
| OCR                        | Google Cloud Vision document text detection | `OcrProvider`         |
| Educational transformation | OpenAI structured output                    | `EducationAdapter`    |
| Optional Waray translation | Qwen-MT                                     | `TranslationProvider` |

Provider support is not proof of classroom quality. Qwen-MT and Waray are stretch scope. Provider
selection uses `auto` inside the backend and is not a normal teacher decision.

## Acceptance journeys

### AC-001 — Text journey

Given a teacher selects English, Cebuano, Grade 5, and Science, when valid lesson text is submitted,
then the system returns the requested teaching-pack sections, warnings, and AI-generated review
status without persisting or logging the content.

### AC-002 — OCR correction journey

Given a valid worksheet image, when extraction succeeds, then the teacher sees editable extracted
text before any localization request. When the teacher corrects it, the corrected text follows
AC-001.

### AC-003 — Preservation warning

Given source text containing a number, measurement, and proper noun, when the translated output
omits or changes a protected token, then the result contains a machine-readable warning and no
invented confidence percentage.

### AC-004 — Provider failure

Given a provider timeout or malformed provider response, when the operation fails, then the client
receives a stable problem response with a request ID and no content, credential, provider payload,
or stack trace.

### AC-005 — Unsafe upload

Given an oversized file, mismatched signature, unsupported format, or excessive dimensions, when the
teacher submits it, then the server rejects it before a provider call and does not write it to disk.

## Out of MVP scope

- student social or chat features;
- automated grading;
- accounts, persistent profiles, or saved lesson libraries;
- a learning-management or school-administration system;
- public user-generated content;
- custom model training;
- native mobile applications;
- multi-page PDFs, large documents, or batch processing;
- audio transcription or text-to-speech;
- community review workflows; and
- claims about improved learning outcomes without a learner study.

## Product success evidence

The hackathon MAY measure request success, median latency, OCR extraction success, structured-output
conformance, and source-number preservation. Teacher-value evidence SHOULD measure preparation time,
minor edits required, usefulness, and willingness to reuse. It MUST NOT claim improved student
learning without a study.

## Open decisions

The following require evidence during their owning phase:

- exact major-error threshold for a stable language label;
- whether the 20,000-character limit meets provider latency and hackathon cost constraints;
- which fourth target language follows Filipino, Cebuano, and Hiligaynon;
- production CORS origins and rate-limit values;
- model identifiers and timeouts; and
- the sanitized, content-free feedback sink for the stateless demo.
