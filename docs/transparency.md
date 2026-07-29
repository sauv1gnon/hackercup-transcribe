# AI and service transparency

**Last reviewed:** 2026-07-29  
**Scope:** Public repository documentation; this disclosure is not rendered in the teacher-facing
product

SalinAral combines AI-assisted software development with external services that perform distinct
parts of the lesson-localisation workflow. The current primary roles are:

| Role                       | Primary system                    | Use in SalinAral                                                                                                    |
| -------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Repository engineering     | Codex GPT 5.6-Sol                 | Primary AI agent assisting with planning, implementation, tests, and documentation under human direction and review |
| Faithful translation       | Google Cloud Translation Advanced | Primary translation pipeline for supported source and target languages                                              |
| Image text extraction      | Google Cloud Vision               | OCR draft generation before teacher correction and localisation                                                     |
| Educational transformation | OpenAI GPT 5.6-Luna               | Primary educator agent for structured, grade-aware explanations, glossary entries, and comprehension questions      |

These roles describe the current implementation and may change as the project evolves. Provider or
model availability does not establish linguistic accuracy, classroom suitability, human review, or
endorsement by the provider. Every generated teaching pack remains an **AI-assisted draft—review
before classroom use**. The teacher retains responsibility for checking meaning, terminology, grade
appropriateness, and local context.

## Temporary demonstration

A public demonstration is available for a limited time at
[https://salinaral.alt-surf.com/](https://salinaral.alt-surf.com/). This is a temporary deployment,
not a permanent service commitment; the address may become unavailable or be removed without notice.

## Public disclosure boundary

This public repository identifies the primary tools, providers, and their responsibilities. It
intentionally does not publish credentials, secret values, private provider payloads, internal
prompts, service identities, or detailed runtime and security configuration. Those details are not
required to understand the system's use of AI and external services and could weaken operational
security.

Naming a provider or model does not imply provider verification, official approval, guaranteed
accuracy, or improved learner outcomes. SalinAral is not approved or endorsed by the Department of
Education.
