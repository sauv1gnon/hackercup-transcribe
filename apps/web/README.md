# Web application boundary

Phase 2 extends the React teacher workspace with a complete teaching-pack request. Teachers compare
the source with editable translation, simplified explanation, glossary, and comprehension-question
sections. Edits remain only in browser memory.

The browser may depend on shared transport contracts. It must not import backend domain,
application, or infrastructure modules.

Run `npm run dev:web` from the repository root. The local browser expects the API at
`http://localhost:3000`.
