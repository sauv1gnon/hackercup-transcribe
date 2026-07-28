# Quality and evaluation strategy

Quality has two distinct tracks:

1. software correctness and operational safety; and
2. language and classroom usefulness.

An API integration can pass software tests while producing unsuitable classroom language. A fluent
translation can still fail privacy, preservation, or schema requirements. Both tracks are release
gates.

## Default verification stack

`npm run check` is the deterministic local and CI gate:

1. Phase and dotenv scope validation;
2. formatting check;
3. JavaScript, TypeScript, and Markdown linting;
4. strict TypeScript compilation;
5. automated tests;
6. OpenAPI linting; and
7. secret scanning.

`npm run audit` is a network-backed supply-chain gate and runs separately so offline deterministic
checks remain usable.

## Test layers by module

| Layer          | Primary evidence                                                                |
| -------------- | ------------------------------------------------------------------------------- |
| Domain         | Pure unit tests for values, invariants, protected-token comparisons             |
| Application    | Use-case tests through deterministic fake ports                                 |
| Contracts      | Schema examples, backward-compatibility checks, generated-type drift check      |
| Infrastructure | Adapter contract tests with sanitized fixtures and opt-in live smoke tests      |
| API            | In-process HTTP tests for validation, errors, headers, limits, and redaction    |
| Web            | Component and interaction tests for editing, errors, accessibility, and actions |
| Deployment     | Health smoke test, identity test, CORS test, rollback exercise                  |

Default tests must not require network access, cloud identity, provider credentials, or real lesson
content.

## Capability and regression evals

Before implementing a capability:

1. define one positive capability case;
2. define malformed input and provider-failure cases;
3. capture the current failure signature;
4. implement the smallest change;
5. re-run focused and full gates; and
6. record the delta and remaining risk.

Regression cases should prioritize:

- missing or changed numbers, units, dates, names, formulas, and negation;
- provider timeouts and malformed structured output;
- empty, excessive, and mixed-script text;
- code-switching and ambiguous words;
- upload signature, dimensions, and allocation limits;
- log redaction and stable error mapping; and
- keyboard and phone-sized teacher workflows.

## Translation evaluation set

Prepare approximately 20 synthetic or properly licensed examples per target language:

| Category                           | Count per language |
| ---------------------------------- | -----------------: |
| Classroom instructions             |                  4 |
| Reading passages                   |                  4 |
| Science explanations               |                  4 |
| Mathematics word problems          |                  4 |
| Social studies or cultural content |                  4 |

The set should cover simple and complex sentences, technical terms, numbers and measurements,
code-switching, proper nouns, ambiguity, negation, and locally relevant expressions. Do not include
student data or copyrighted textbook passages without permission.

Evaluation records conform to `specs/schemas/evaluation-record.schema.json`. Dataset text and
generated results should live in a separately reviewed fixture location only when the relevant phase
begins.

## Human rubric

At least one native or fluent speaker scores each output from 1 to 5:

1. meaning preserved;
2. grammar and fluency;
3. terminology suitability;
4. grade-level readability; and
5. cultural naturalness.

Reviewers also record severe errors:

- reversed meaning;
- incorrect number or measurement;
- missing negation;
- invented information;
- inappropriate translation of a name or technical term; and
- unnatural or incomprehensible phrasing.

Round-trip translation is never the sole quality test.

## Language release labels

| Label        | Minimum evidence                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| Experimental | Adapter works; limited human review                                                                             |
| Beta         | At least 20 category-balanced examples reviewed by one fluent speaker                                           |
| Stable       | Multiple fluent speakers or teachers review the set and major-error rate meets an explicitly accepted threshold |

The stable major-error threshold is intentionally open until the team sees baseline results and
records a decision. Provider documentation alone cannot raise a label.

## Structured-output quality

Educational output tests verify:

- schema conformance;
- exactly the requested sections;
- three to five questions with required types;
- glossary fields are non-empty;
- text length remains within contract bounds;
- source-only grounding;
- no vanished protected token without a warning; and
- no raw HTML or executable markup behavior.

A parser repair loop, if introduced, must be bounded and observable. It must not silently accept
invalid content.

## Performance and cost

Track per operation:

- success and result category;
- end-to-end and provider duration;
- request character or image byte count;
- retry count;
- provider alias;
- structured-output conformance;
- source-number preservation; and
- estimated or reported provider usage when available without content.

Set budgets during the owning phase after baseline measurements. Avoid performance claims before the
deployed path is measured.

## Teacher-value evidence

For the hackathon, collect:

- time to create a localized teaching aid;
- whether the result is usable after minor editing;
- number and category of corrections;
- teacher usefulness rating; and
- willingness to use the workflow again.

Do not claim improved student learning without a learner study.

## Phase exit evidence

Every phase completion record includes:

- exit-condition acceptance case;
- command output or CI link;
- contract version;
- implemented requirement IDs;
- security acceptance cases run;
- known quality gaps and language labels; and
- rollback or disable path for provider-backed behavior.
