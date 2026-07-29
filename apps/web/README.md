# Web application boundary

Phase 3 lets a teacher select one JPEG, PNG, or WebP worksheet image and place its extracted text
into the existing editable source field. OCR does not trigger localisation; the teacher reviews the
text and submits it separately. Source and result edits remain only in browser memory.

The browser may depend on shared transport contracts. It must not import backend domain,
application, or infrastructure modules.

Run `npm run dev:web` from the repository root. The local browser expects the API at
`http://localhost:3000`.
