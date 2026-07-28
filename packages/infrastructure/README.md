# Infrastructure module

Owns external provider adapters, runtime configuration, logging, and other technical integrations.
It may depend on application ports and domain concepts; inner layers never depend on it.

Phase 1 implements Google Cloud Translation Advanced, validated runtime settings, and a content-safe
operational logger.
