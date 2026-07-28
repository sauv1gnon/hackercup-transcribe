# Web application boundary

Phase 1 contains the React teacher text workspace. It lets a teacher choose lesson context, submit
plain text, and compare a returned translation with the source.

The browser may depend on shared transport contracts. It must not import backend domain,
application, or infrastructure modules.

Run `npm run dev:web` from the repository root. The local browser expects the API at
`http://localhost:3000`.
