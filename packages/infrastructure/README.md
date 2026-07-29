# Infrastructure module

Owns external provider adapters, runtime configuration, logging, and other technical integrations.
It may depend on application ports and domain concepts; inner layers never depend on it.

Phase 3 adds decoded JPEG, PNG, and WebP validation with metadata removal plus Google Vision
document-text extraction. Image and OCR content remain request-scoped, provider calls have bounded
timeouts, and errors map to stable application failures.
