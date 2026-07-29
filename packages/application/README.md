# Application module

Owns use cases and provider ports. It may depend only on the domain module.

Phase 3 adds the provider-neutral OCR port and image-extraction use case. The use case enforces
documented size and dimension limits and validates the extracted text before returning a
review-required draft.
