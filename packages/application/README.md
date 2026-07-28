# Application module

Owns use cases and provider ports. It may depend only on the domain module.

Phase 2 adds the education adapter boundary and localisation orchestration. It preserves the
translation-only path and calls educational transformation once when any educational section is
requested.
