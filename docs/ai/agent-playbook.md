# AI agent playbook

The repository `AGENTS.md` is normative. This playbook supplies a compact task protocol so future
agents can enter the project without reconstructing context.

## Task packet

Before work, write down:

| Field         | Required content                                      |
| ------------- | ----------------------------------------------------- |
| Goal          | One observable outcome                                |
| Phase         | Active phase from `docs/delivery/status.json`         |
| Requirements  | Product or non-functional IDs                         |
| Owner         | One primary module                                    |
| Contract      | OpenAPI/schema/domain behavior affected               |
| Baseline      | Failing test, missing capability, or current evidence |
| Dominant risk | Correctness, privacy, provider, UI, rollout, or cost  |
| Done          | Exact command and acceptance evidence                 |

A unit should usually fit a short focused session. Split work when it has multiple dominant risks.

## Context routes

Read only the route that applies after the mandatory root read order:

| Work               | Additional context                                          |
| ------------------ | ----------------------------------------------------------- |
| Product behavior   | `docs/product/product-spec.md`, relevant acceptance journey |
| HTTP API           | `specs/openapi.yaml`, ADR-0002, security baseline           |
| Domain or use case | architecture module rules, product vocabulary               |
| Provider adapter   | ADR-0004, runtime contract, provider contract tests         |
| Upload or OCR      | FR-004, NFR-001 through NFR-007, ADR-0002                   |
| UI                 | FR-001 through FR-010, accessibility section, contracts     |
| Evaluation         | `docs/quality/quality-strategy.md`, evaluation schema       |
| Delivery           | roadmap, status, relevant phase exit condition              |

## Change sequence

1. Confirm the phase permits the work.
2. Identify ambiguous requirements and resolve only material ones.
3. Update the narrowest authoritative contract.
4. Add a failing acceptance, unit, contract, or policy check.
5. Implement in the owning module without widening dependencies.
6. Verify malformed input, timeout, cancellation, and redaction behavior.
7. Run the focused check and `npm run check`.
8. Review the diff for content logs, secrets, SDK-type leakage, and unrelated changes.
9. Record status only after exit evidence exists.

## Provider implementation checklist

- Validate runtime configuration at startup or adapter construction.
- Set a bounded timeout and propagate cancellation.
- Validate unknown provider output before mapping it.
- Map provider errors to stable application categories.
- Never include request content in thrown messages or logs.
- Record only provider alias, timing, result category, and request ID.
- Use deterministic fakes in default tests.
- Keep live tests opt-in and skip cleanly when runtime credentials are absent.
- Document cost and quota assumptions.

## Handoff template

```text
Outcome:
Requirements:
Owning module:
Contracts changed:
Checks run:
Security/privacy review:
Known risks:
Next phase-safe task:
```

Do not hand off with “tests should pass.” Run them or identify the exact blocker and evidence.
