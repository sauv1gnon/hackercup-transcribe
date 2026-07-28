# Infrastructure module

Owns external provider adapters, runtime configuration, logging, and other technical integrations.
It may depend on application ports and domain concepts; inner layers never depend on it.

Phase 2 adds OpenAI Responses API structured educational output using `gpt-5.6-luna`, with
request-scoped processing, disabled response storage, bounded timeouts, and stable provider-error
mapping.
