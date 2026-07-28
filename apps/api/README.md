# API application boundary

Phase 1 contains the Fastify API composition root and the health, language, and text-localisation
routes.

The API may depend on `domain`, `application`, `contracts`, and `infrastructure`. Business rules
must not live here.

Runtime setup is described in `docs/development/phase-1-developer-handoff.md`. Run `npm run dev:api`
from the repository root after setting the listed process values.
