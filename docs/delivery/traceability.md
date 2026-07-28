# Requirement traceability

This matrix routes each product requirement to its owning phase, primary module, contract, and
acceptance evidence. It is a planning index, not proof that later-phase behavior exists.

## Functional requirements

| Requirement                      | Phase   | Primary owner                   | Contract or acceptance evidence          |
| -------------------------------- | ------- | ------------------------------- | ---------------------------------------- |
| FR-001 Accountless entry         | 1       | `web`                           | AC-001; no auth path in OpenAPI          |
| FR-002 Lesson context            | 1       | `contracts`, `web`              | `LocalisationRequest`                    |
| FR-003 Text submission           | 1       | `api`, `application`            | AC-001; text bounds in OpenAPI           |
| FR-004 Reviewed image extraction | 3       | `api`, `infrastructure`, `web`  | AC-002, AC-005; OCR operation            |
| FR-005 Teaching pack             | 2       | `application`, `infrastructure` | AC-001; Phase 2 educational-output test  |
| FR-006 Teacher editing and reuse | 2 and 4 | `web`                           | Editable Phase 2 pack; Phase 4 actions   |
| FR-007 Review and provenance     | 2 and 4 | `domain`, `contracts`, `web`    | AI draft and local teacher-edited states |
| FR-008 Language discovery        | 1 and 4 | `domain`, `api`                 | Languages operation; evaluation evidence |
| FR-009 Preservation warnings     | 4       | `domain`, `application`         | AC-003; warning schema                   |
| FR-010 Demonstration samples     | 4       | `web`                           | End-to-end demo acceptance               |
| FR-011 Lightweight feedback      | Stretch | `web`, `api`                    | Content-free feedback contract decision  |

## Non-functional requirements

| Requirement                           | Begins | Primary owner                         | Evidence                                 |
| ------------------------------------- | ------ | ------------------------------------- | ---------------------------------------- |
| NFR-001 Stateless processing          | 0      | Architecture and every runtime module | ADR-0003; content-retention tests        |
| NFR-002 Privacy-safe observability    | 0      | `infrastructure`, `api`               | Log allowlist and SEC-002                |
| NFR-003 Runtime-only credentials      | 0      | `infrastructure`, deployment          | Runtime manifest and SEC-001/SEC-009     |
| NFR-004 Input limits                  | 0      | `contracts`, `api`                    | OpenAPI limits and AC-005                |
| NFR-005 Validation and safe rendering | 1      | All boundaries                        | Contract/provider/UI tests               |
| NFR-006 Network protection            | 1      | `api`, deployment                     | SEC-005/SEC-006                          |
| NFR-007 Failure behavior              | 1      | `application`, `api`, adapters        | AC-004 and problem schemas               |
| NFR-008 Accessibility and devices     | 1      | `web`                                 | Interaction and accessibility acceptance |
| NFR-009 Contract compatibility        | 0      | `contracts`, `api`                    | OpenAPI lint and compatibility check     |
| NFR-010 Reproducible quality          | 0      | Repository tooling                    | `npm ci`, `npm run check`, CI            |

When behavior changes, update the product requirement, contract, this matrix, and evidence in one
change.
