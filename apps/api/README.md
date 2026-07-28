# API application boundary

Phase 2 extends the Fastify API composition root and text-localisation route with structured
educational output. Translation-only requests still use Google alone; educational requests add the
OpenAI adapter and return requested teaching-pack sections.

The API may depend on `domain`, `application`, `contracts`, and `infrastructure`. Business rules
must not live here.

Runtime setup is described in `docs/development/phase-1-developer-handoff.md`. Run `npm run dev:api`
from the repository root after setting the listed process values.
