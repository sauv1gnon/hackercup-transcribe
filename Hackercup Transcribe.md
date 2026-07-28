# Recommended product direction

The strongest version of this product is **not another general-purpose translator**. It should be a **teacher-facing lesson localisation workspace** that converts English or Filipino learning materials into classroom-ready explanations using Philippine languages.

The central problem should also be reframed. Philippine linguistic diversity is not itself the problem; the problem is the **mismatch between the language used in available learning materials and the language learners use to understand difficult concepts**.

There is also an important policy consideration. Republic Act No. 12027 discontinued the mandatory use of the mother tongue as the primary medium of instruction from Kindergarten to Grade 3\. Filipino and English are now the principal media of instruction, while regional languages may serve as auxiliary media. Mother-tongue instruction remains optional for qualifying monolingual classes. Positioning the system as an **auxiliary linguistic-scaffolding tool** is therefore more accurate and policy-aligned than presenting it as a replacement medium of instruction. citeturn796108search1

Use **“Philippine languages”** or **“regional languages”** in the presentation instead of referring to all of them as dialects.

---

# Refined product concept

## Working name

**SalinAral**

Alternative names could include WikaBridge, AralWika, or LingoAral, but SalinAral immediately communicates translation and education.

## Revised problem statement

> Teachers in multilingual Philippine classrooms frequently rely on learning materials written primarily in English or Filipino, even when their learners understand difficult ideas more effectively through a regional language. Teachers must manually translate, simplify, contextualise, and explain these materials, increasing preparation time and producing inconsistent learning support.

## Revised solution statement

> SalinAral is an AI-assisted lesson localisation workspace for Filipino teachers. Educators can paste text or upload a photograph of learning material and receive an editable, grade-appropriate translation, simplified explanation, key-term glossary, and comprehension questions in a selected Philippine language.

## One-sentence pitch

> **SalinAral turns standard English and Filipino learning materials into teacher-reviewed, classroom-ready explanations in Philippine languages.**

## Presentation pitch

> The Philippines is linguistically diverse, but most digital learning materials remain concentrated in English and Filipino. This creates a comprehension gap for learners who process unfamiliar concepts through another regional language.  
>   
> SalinAral helps teachers bridge that gap. A teacher can paste a lesson or photograph a worksheet, select the learner’s language and grade level, and generate an editable teaching aid containing a faithful translation, simpler explanation, vocabulary guide, and comprehension questions.  
>   
> SalinAral does not replace teachers or prescribe a medium of instruction. It gives teachers a faster way to provide culturally and linguistically appropriate learning support.

---

# Target users

## Primary user: Classroom teacher

The initial target should be public-school elementary and junior-high-school teachers who:

- Teach learners with mixed English, Filipino, and regional-language proficiency.  
- Regularly explain lessons informally in a regional language.  
- Spend time manually translating worksheets, examples, and instructions.  
- Have limited access to officially localised materials.

## Secondary users

- Alternative Learning System educators.  
- Volunteer tutors and ARAL programme tutors.  
- Local government education programmes.  
- Indigenous Peoples Education facilitators.  
- Parents helping children understand assignments.

For the hackathon, design everything around the **teacher workflow**. A broad student-facing platform would create unnecessary concerns around accounts, minors, moderation, and unsupervised AI-generated instruction.

---

# SDG 4 alignment

The system has the clearest connection to:

- **SDG 4.1:** Improving relevant and effective primary and secondary learning outcomes.  
- **SDG 4.5:** Reducing educational disparities affecting vulnerable, rural, indigenous, and linguistically marginalised learners.  
- **SDG 4.6:** Supporting literacy and comprehension.  
- **SDG 4.c:** Giving teachers practical tools that strengthen instructional capacity.

These targets focus on learning outcomes, equitable access, literacy, and teacher capacity—not merely the availability of technology. citeturn126780search0

The project should therefore measure whether the localised output helps teachers explain a lesson, rather than reporting only the number of translations generated.

---

# MVP product flow

## Primary workflow

1. The teacher opens the website without creating an account.  
2. The teacher chooses:  
   - Source language.  
   - Target Philippine language.  
   - Grade level.  
   - Subject.  
3. The teacher either:  
   - Pastes text.  
   - Uploads or photographs a worksheet, textbook page, or lesson material.  
4. The system extracts and displays the source text.  
5. The teacher corrects any OCR mistakes before continuing.  
6. The system generates a localised teaching pack.  
7. The teacher edits, copies, prints, or exports the result.

## Output structure

Instead of returning only one translated paragraph, return four tabs:

### *1\. Faithful translation*

A close translation preserving the meaning, names, numbers, formulas, and instructions.

### *2\. Simplified explanation*

A grade-appropriate explanation using shorter sentences and familiar language.

### *3\. Key-term glossary*

A table containing:

| Original term | Localised term | Simple explanation |
| :---- | :---- | :---- |
| Photosynthesis | Local equivalent | How plants use light to make food |
| Chlorophyll | Retained/local term | The green substance that absorbs light |

Technical terms that should remain in English can be retained with an explanation rather than forcibly translated.

### *4\. Comprehension check*

Three to five editable questions based only on the supplied material:

- One recall question.  
- One explanation question.  
- One application question.

This transforms SalinAral from a one-trick translation tool into a **teacher preparation assistant**, while using the same underlying content pipeline.

---

# Translation API recommendation

## Primary recommendation: Google Cloud Translation Advanced

Use **Google Cloud Translation Advanced as the primary provider for the MVP**.

The current Google Cloud documentation lists more Philippine languages than the notes indicate. Its supported text-translation languages include:

- Bikol  
- Cebuano  
- Filipino or Tagalog  
- Hiligaynon  
- Iloko  
- Kapampangan  
- Pangasinan

Waray does not currently appear in Google Cloud Translation’s supported-language list. Therefore, the statement that Google supports only Cebuano, Filipino, Waray, and English should be corrected: Google supports several additional Philippine languages, but apparently not Waray. citeturn832647view0turn832647view1turn620636view3turn832647view4

### *Recommended Google-only MVP languages*

Start with:

- English  
- Filipino  
- Cebuano  
- Hiligaynon

Then add one of the following if time permits:

- Iloko  
- Kapampangan  
- Pangasinan  
- Bikol

This gives the demonstration Luzon, Visayas, and national-language coverage without requiring multiple providers.

### *Why Google should be primary*

- It is already compatible with the chosen Google Cloud deployment.  
- Authentication can use a Cloud Run service account rather than exposed API keys.  
- It supports direct text translation and language detection.  
- It integrates cleanly with Google Cloud Vision for OCR.  
- It reduces cross-cloud configuration during a time-limited hackathon.  
- It can be hidden behind a provider interface, allowing replacement later.

Official support does **not** guarantee classroom-quality translation. Every language must still be tested with native speakers and teachers.

---

## Waray or broader-language option: Qwen-MT

If Waray is essential to the intended demonstration, add **Qwen-MT through Alibaba Cloud Model Studio** as a secondary provider.

Qwen-MT supports 92 languages and documents support for Cebuano, Pangasinan, Tagalog, and Waray. It also offers terminology intervention, domain prompting, and translation memory, which are useful for controlling educational vocabulary. citeturn396083search14turn433562view2

Alibaba’s broader Machine Translation service also documents support for more than 200 languages, including Filipino, Cebuano, Waray, Pangasinan, and Chavacano. citeturn433562view3turn396083search0

### *Recommended hybrid routing*

| Target language | Primary provider | Fallback |
| :---- | :---- | :---- |
| Filipino | Google | Qwen-MT |
| Cebuano | Google | Qwen-MT |
| Hiligaynon | Google | None for MVP |
| Iloko | Google | General multilingual model, experimental |
| Kapampangan | Google | General multilingual model, experimental |
| Pangasinan | Google | Qwen-MT |
| Bikol | Google | None for MVP |
| Waray | Qwen-MT | Alibaba General MT |

Do not expose these provider decisions to normal users. The backend should accept `provider: "auto"` and route the request internally.

---

## Where OpenAI fits

OpenAI should be used for **educational transformation**, not as the authoritative translation engine.

Suitable tasks include:

- Simplifying a translated lesson for a specific grade.  
- Producing a glossary from source and translated text.  
- Generating comprehension questions.  
- Providing locally familiar examples.  
- Checking whether important names, quantities, and scientific terms disappeared.  
- Returning structured JSON.

OpenAI’s current models provide broad multilingual and multimodal capabilities, but the published materials do not provide the same explicit Philippine-language coverage matrix offered by Google Cloud Translation or Qwen-MT. OpenAI’s speech systems are multilingual, and its newer models report improved performance across multilingual benchmarks, but that is not equivalent to guaranteed translation support for a particular Philippine language. citeturn460348search0turn460348search5turn460348search6

### *Recommended division of responsibilities*

```
Google/Qwen-MT:
Faithful language translation

OpenAI:
Grade-level adaptation
Glossary generation
Question generation
Structured educational output
Translation consistency checking
```

The OpenAI stage must receive both the original text and translated text. It should be instructed not to introduce facts absent from the original material.

---

## Where xAI fits

Do not make xAI the primary provider for this MVP.

xAI documents multilingual voice experiences controlled through system instructions, but its public documentation does not provide a clear support matrix for individual Philippine languages or specialised machine-translation controls. It could be included later as a benchmark provider, but it adds uncertainty without solving a current MVP requirement. citeturn396083search35

---

## Open-source alternative: Meta NLLB-200

Meta’s No Language Left Behind model translates across 200 languages and was specifically developed for multilingual and low-resource translation research. citeturn433562view4

However, it is not the best hackathon primary because:

- Hosting requires more infrastructure.  
- Model start-up and inference can be expensive.  
- Deployment may require GPU resources.  
- Quality still requires language-specific evaluation.  
- Its published model card primarily presents it as a research model.

It is a valuable **future offline or sovereignty-oriented path**, particularly if the product eventually needs to serve schools with intermittent connectivity or avoid dependence on commercial APIs.

---

# Recommended technical architecture

```
┌──────────────────────────────────────────────┐
│ React Web Application                        │
│                                              │
│ Text Input | Image Upload | Result Editor    │
└──────────────────────┬───────────────────────┘
                       │ HTTPS
┌──────────────────────▼───────────────────────┐
│ Node.js API on Cloud Run                     │
│                                              │
│ Controllers                                  │
│ Application Use Cases                        │
│ Translation Orchestrator                     │
│ Validation and Safety                        │
└──────────┬──────────────┬──────────────┬─────┘
           │              │              │
┌──────────▼───────┐ ┌────▼──────────┐ ┌─▼────────────────┐
│ Google Vision OCR│ │ Translation   │ │ Education Adapter│
│                  │ │ Provider Port │ │ OpenAI or similar│
└──────────────────┘ └────┬──────────┘ └──────────────────┘
                          │
                 ┌────────┴────────┐
                 │                 │
          ┌──────▼──────┐  ┌──────▼──────┐
          │ Google      │  │ Qwen-MT     │
          │ Translation │  │ Optional    │
          └─────────────┘  └─────────────┘
```

## Clean Architecture modules

### *Domain layer*

Provider-independent definitions:

```
Language
TranslationRequest
TranslationResult
ExtractedDocument
TeachingPack
GlossaryEntry
ComprehensionQuestion
TranslationWarning
```

The domain layer must not import Google, Alibaba, OpenAI, Express, or Cloud-specific SDKs.

### *Application layer*

Use cases:

```
TranslateText
ExtractTextFromImage
LocaliseLesson
GenerateTeachingPack
ValidateTranslation
ListSupportedLanguages
```

### *Ports*

Interfaces such as:

```ts
interface TranslationProvider {
  supports(source: LanguageCode, target: LanguageCode): boolean;

  translate(
    request: TranslationRequest
  ): Promise<TranslationProviderResult>;
}

interface OcrProvider {
  extractText(input: OcrInput): Promise<OcrResult>;
}

interface EducationAdapter {
  buildTeachingPack(
    input: TeachingPackInput
  ): Promise<TeachingPack>;
}
```

### *Infrastructure adapters*

```
GoogleTranslationAdapter
QwenTranslationAdapter
GoogleVisionOcrAdapter
OpenAIEducationAdapter
CloudLoggingAdapter
```

### *Presentation layer*

```
TranslationController
ImageTranslationController
LanguageController
HealthController
```

This design ensures that changing translation providers does not require rewriting the interface or application logic.

---

# Proposed API surface

## List supported languages

```
GET /api/v1/languages
```

Example response:

```json
{
  "languages": [
    {
      "code": "fil",
      "name": "Filipino",
      "status": "stable"
    },
    {
      "code": "ceb",
      "name": "Cebuano",
      "status": "stable"
    },
    {
      "code": "hil",
      "name": "Hiligaynon",
      "status": "beta"
    },
    {
      "code": "war",
      "name": "Waray",
      "status": "experimental"
    }
  ]
}
```

## Translate text

```
POST /api/v1/localise/text
Content-Type: application/json
```

```json
{
  "sourceLanguage": "en",
  "targetLanguage": "ceb",
  "text": "Plants use sunlight to produce food.",
  "gradeLevel": 5,
  "subject": "science",
  "outputs": [
    "translation",
    "simplified_explanation",
    "glossary",
    "questions"
  ]
}
```

Example response:

```json
{
  "requestId": "req_123",
  "sourceText": "Plants use sunlight to produce food.",
  "translation": "...",
  "simplifiedExplanation": "...",
  "glossary": [
    {
      "sourceTerm": "sunlight",
      "translatedTerm": "...",
      "explanation": "..."
    }
  ],
  "questions": [
    {
      "type": "recall",
      "question": "..."
    }
  ],
  "provider": {
    "translation": "google",
    "education": "openai"
  },
  "reviewStatus": "ai_generated",
  "warnings": []
}
```

## Extract and localise an image

```
POST /api/v1/localise/image
Content-Type: multipart/form-data
```

Fields:

```
file
sourceLanguage
targetLanguage
gradeLevel
subject
```

The API should return the OCR text before or alongside the final result so the teacher can correct extraction errors.

---

# Image modality without persistent storage

For the hackathon MVP, Cloud Storage is not required.

Use the following flow:

1. The browser compresses the image.  
2. The frontend submits it as `multipart/form-data`.  
3. The Node.js backend validates:  
   - File type.  
   - Actual file signature.  
   - Dimensions.  
   - File size.  
4. The backend holds the image in a memory buffer.  
5. The buffer is sent directly to Cloud Vision OCR.  
6. Extracted text is returned.  
7. The buffer is discarded when the request finishes.

Google Cloud Vision supports multilingual OCR and lists Filipino and Cebuano among its OCR languages. citeturn796108search2turn796108search12

Cloud Run containers have a writable but nonpersistent filesystem. Data disappears when the container instance shuts down, so local files must never be treated as durable storage. citeturn528344search3

## Recommended upload constraints

- JPEG, PNG, and WebP only.  
- Maximum size: 5 MB.  
- One image per request.  
- Maximum image dimensions: approximately 4,000 × 4,000.  
- Reject executable, SVG, archive, and document formats.  
- Remove metadata when feasible.  
- Apply a request timeout.  
- Do not log extracted text.

## When Cloud Storage becomes necessary

Introduce a temporary Cloud Storage bucket only for:

- Multi-page PDFs.  
- Large document batches.  
- Asynchronous OCR.  
- Teacher-created resource libraries.

Cloud Storage supports lifecycle rules for automatically deleting temporary objects. However, soft deletion is enabled by default for new buckets and may retain deleted objects temporarily, so privacy and retention settings must be reviewed explicitly. citeturn528344search0turn528344search14

For the MVP, direct in-memory processing is simpler and better matches the stateless requirement.

---

# OCR pipeline

Image translation should be a two-stage process, not a single black-box action.

```
Uploaded Image
      ↓
Image validation and compression
      ↓
OCR extraction
      ↓
Teacher reviews extracted text
      ↓
Text normalisation
      ↓
Translation
      ↓
Educational transformation
      ↓
Editable teaching pack
```

The review step matters because OCR errors involving decimals, negative signs, chemical symbols, formulas, and names can produce misleading translations.

The system should visually flag:

- Numbers.  
- Dates.  
- Equations.  
- Proper nouns.  
- Scientific terminology.  
- Text with low OCR confidence.

---

# Translation orchestration

## Provider selection

```ts
function selectProvider(targetLanguage: string): TranslationProvider {
  if (targetLanguage === 'war') {
    return qwenTranslationProvider;
  }

  if (googleTranslationProvider.supports('en', targetLanguage)) {
    return googleTranslationProvider;
  }

  throw new UnsupportedLanguageError(targetLanguage);
}
```

## Processing rules

Before translation:

- Trim unnecessary whitespace.  
- Preserve paragraph boundaries.  
- Protect URLs, equations, code, names, and measurements.  
- Reject empty or excessively long submissions.  
- Ask users to identify the source language instead of relying entirely on automatic detection.  
- Break very long text into paragraphs, not arbitrary character chunks.

After translation:

- Compare all numbers in the source and output.  
- Check that names and formulas remain present.  
- Generate a warning if content appears missing.  
- Return the provider name and review status.  
- Never display a fabricated “97% accurate” confidence score.

Use review labels instead:

```
AI generated
Teacher edited
Native-speaker reviewed
Community verified
```

---

# Frontend experience

## Main workspace

```
┌─────────────────────────────────────────────────────┐
│ Source: English  →  Target: Cebuano                 │
│ Grade: 5          Subject: Science                  │
├─────────────────────────┬───────────────────────────┤
│ Source material         │ Localised result          │
│                         │                           │
│ Paste text or upload    │ Translation               │
│ an image                │ Simplified                │
│                         │ Glossary                  │
│                         │ Questions                 │
├─────────────────────────┴───────────────────────────┤
│ Translate | Copy | Print | Download                 │
└─────────────────────────────────────────────────────┘
```

## Important interface elements

- “Try a sample lesson” button.  
- Side-by-side source and translated text.  
- Editable result fields.  
- Clear AI-generated-content warning.  
- Copy and print actions.  
- “Report incorrect translation” action.  
- Language status badges:  
  - Stable  
  - Beta  
  - Experimental  
- Responsive mobile layout for teachers using phones.  
- Large text and touch targets.  
- Avoid requiring registration.

## Sample lessons

Provide three built-in examples:

1. Grade 3 reading passage.  
2. Grade 5 science explanation.  
3. Grade 7 mathematics word problem.

A teacher should be able to experience the value without typing anything.

---

# Solving the teacher-onboarding problem

The platform should promise a concrete teaching outcome rather than asking teachers to “use AI.”

## Teacher-facing value proposition

> Upload one lesson and receive an editable explanation, glossary, and short assessment in the language your learners understand.

## Adoption mechanisms

### *1\. Immediate value without registration*

The first useful result should require no account, tutorial, or configuration beyond selecting a language and grade level.

### *2\. Start from existing teacher behaviour*

Teachers already:

- Take pictures of worksheets.  
- Copy lesson text.  
- Translate verbally.  
- Create vocabulary lists.  
- Prepare review questions.

SalinAral should compress these existing tasks into one workflow instead of introducing an entirely new teaching process.

### *3\. Preserve teacher authority*

Every generated field must be editable.

Use:

> “AI-assisted draft—review before classroom use.”

Avoid:

> “Verified translation”  
> “Guaranteed accurate”  
> “AI-certified lesson”

### *4\. Provide reusable teaching outputs*

A translator is used occasionally. A lesson-preparation workspace can be used repeatedly.

The product becomes reusable by generating:

- Lesson explanations.  
- Vocabulary sheets.  
- Classroom instructions.  
- Word-problem localisation.  
- Reading passages.  
- Review questions.  
- Parent-facing assignment instructions.

### *5\. Show source and result together*

Teachers are more likely to trust the tool when they can compare outputs rather than receiving unexplained generated content.

### *6\. Build correction into the product*

Add lightweight feedback:

```
Was this useful?
[Yes] [Needs correction]

What needs correction?
[Meaning] [Grammar] [Terminology] [Cultural context]
```

For the stateless MVP, this can initially create an anonymised structured log without saving the full lesson text.

---

# Quality assurance plan

API support alone is insufficient. Translation quality should be assessed before a language is labelled “stable.”

## Mini evaluation dataset

Prepare approximately 20 examples per target language:

| Category | Suggested examples |
| :---- | ----: |
| Classroom instructions | 4 |
| Reading passages | 4 |
| Science explanations | 4 |
| Mathematics word problems | 4 |
| Social studies or cultural content | 4 |

Include:

- Simple and complex sentences.  
- Technical terms.  
- Numbers and measurements.  
- Code-switching.  
- Proper nouns.  
- Ambiguous words.  
- Locally relevant expressions.

## Human evaluation rubric

Ask at least one native or fluent speaker to score each output from 1 to 5:

1. Meaning preserved.  
2. Grammar and fluency.  
3. Terminology suitability.  
4. Grade-level readability.  
5. Cultural naturalness.

Also record severe errors:

- Reversed meaning.  
- Incorrect number.  
- Missing negation.  
- Invented information.  
- Inappropriate translation of a name or technical term.  
- Unnatural or incomprehensible phrasing.

## Language release criteria

```
Experimental:
API integration works, but limited review

Beta:
At least 20 examples reviewed by one fluent speaker

Stable:
Reviewed by multiple fluent speakers or teachers,
with major-error rate below the team’s agreed threshold
```

Do not use round-trip translation as the sole accuracy test. A sentence can translate incorrectly and still return to something similar when translated back.

---

# Privacy and safety requirements

Because teachers may upload real classroom material:

- Do not request student names.  
- Warn users not to upload grades, identification numbers, addresses, or student records.  
- Do not retain uploaded images in the MVP.  
- Do not log the original lesson or translation.  
- Store API keys only in Secret Manager.  
- Use service-account authentication for Google APIs.  
- Add rate limiting per IP.  
- Validate actual file signatures, not only filename extensions.  
- Escape generated content before rendering it.  
- Configure a strict Content Security Policy.  
- Restrict CORS to the production frontend.  
- Set maximum text and image sizes.  
- Include a visible human-review warning.  
- Do not claim that content is DepEd-approved.

---

# Scope prioritisation

## Must have

1. React responsive website.  
2. Text input.  
3. Google Translation adapter.  
4. English, Filipino, Cebuano, and one additional regional language.  
5. Side-by-side editable results.  
6. Grade and subject selectors.  
7. Image upload.  
8. Google Vision OCR.  
9. Simplified explanation.  
10. Glossary generation.  
11. Comprehension questions.  
12. Copy and print support.  
13. No-account demo.  
14. Clear AI-review warning.

## Should have

1. Qwen-MT Waray adapter.  
2. Translation provider routing.  
3. Built-in example lessons.  
4. Download as text or printable HTML.  
5. Feedback buttons.  
6. Preservation checks for names and numbers.  
7. Mobile camera capture.

## Could have

1. Audio transcription.  
2. Text-to-speech.  
3. PDF export.  
4. Teacher accounts.  
5. Saved lesson libraries.  
6. Community translation review.  
7. Offline Progressive Web App.  
8. School dashboards.  
9. Custom terminology collections.  
10. DepEd curriculum alignment.

## Do not build during the MVP

- Student social features.  
- Real-time chat.  
- Automated grading.  
- Full learning-management system.  
- Persistent student profiles.  
- Complex school administration.  
- User-generated public content.  
- Custom model training.  
- Native mobile applications.  
- Large document processing.

---

# Suggested 48-hour hackathon plan

## Phase 1: Foundation

- Create React and Node.js TypeScript projects.  
- Establish the clean-architecture folders.  
- Deploy a minimal API to Cloud Run.  
- Add health-check and supported-language endpoints.  
- Implement Google Translation.  
- Build the text-input workspace.

**Exit condition:** Text can be translated between English, Filipino, Cebuano, and one additional language.

## Phase 2: Educational output

- Add grade level and subject.  
- Implement the educational-adaptation provider.  
- Produce structured translation, simplification, glossary, and questions.  
- Build result tabs.  
- Make all outputs editable.

**Exit condition:** One input produces a complete teaching pack.

## Phase 3: Image modality

- Add mobile-compatible image upload.  
- Validate and compress images.  
- Integrate Cloud Vision OCR.  
- Show extracted text for correction.  
- Connect OCR output to the existing text pipeline.

**Exit condition:** A photographed worksheet produces editable localised content.

## Phase 4: Trust and demonstration

- Add sample lessons.  
- Add copy and print support.  
- Add AI-generated warnings.  
- Add number and proper-noun preservation checks.  
- Test the selected languages with fluent speakers.  
- Prepare before-and-after examples.

**Exit condition:** The demo tells a complete teacher story without manual intervention.

## Stretch phase

- Add Qwen-MT for Waray.  
- Add provider comparison in an internal developer panel.  
- Add feedback categorisation.  
- Add printable worksheet formatting.

---

# Success metrics

For the hackathon demonstration, use measurable indicators:

## Technical metrics

- Translation request success rate.  
- Median response time.  
- OCR extraction success rate.  
- Percentage of source numbers preserved.  
- Percentage of outputs following the required JSON structure.

## Teacher-value metrics

- Time required to produce a localised teaching aid.  
- Percentage of outputs considered usable after minor editing.  
- Teacher usefulness rating.  
- Number of corrections needed per output.  
- Percentage of teachers willing to use the tool for another lesson.

## Impact hypothesis

> Teachers using SalinAral can create a localised explanation, vocabulary guide, and comprehension activity faster than preparing the same materials manually.

Do not claim improved student learning during the hackathon unless an actual learner study has been conducted.

---

# Demonstration narrative

The strongest presentation demo would be:

1. Show an English Grade 5 science worksheet.  
2. Explain that a teacher must present it to predominantly Cebuano-speaking learners.  
3. Photograph the worksheet using a phone.  
4. Let SalinAral extract the text.  
5. Correct one deliberate OCR mistake.  
6. Select:  
   - Cebuano.  
   - Grade 5\.  
   - Science.  
7. Generate:  
   - Faithful translation.  
   - Simpler explanation.  
   - Vocabulary list.  
   - Three questions.  
8. Edit one term to demonstrate teacher control.  
9. Print or copy the localised teaching aid.  
10. Show the same input routed to Waray as an experimental Qwen-MT demonstration, if implemented.

The central demo message should be:

> “The teacher remains the educator. SalinAral removes the repetitive work needed to make a lesson linguistically accessible.”

---

# Final recommended stack

```
Frontend
React + TypeScript
Vite
React Hook Form
Zod
TanStack Query

Backend
Node.js + TypeScript
Fastify or Express
Zod validation
Modular Clean Architecture

Primary translation
Google Cloud Translation Advanced

Optional Waray/fallback translation
Qwen-MT through Alibaba Cloud Model Studio

OCR
Google Cloud Vision DOCUMENT_TEXT_DETECTION

Educational transformation
OpenAI structured-output model

Deployment
Cloud Run frontend
Cloud Run backend
Artifact Registry
Secret Manager
Cloud Logging

Storage
None for initial text and image MVP
Temporary Cloud Storage only for future large-document support
```

The most defensible MVP is therefore:

> **A stateless teacher tool that accepts text or a photographed learning resource and produces an editable, grade-appropriate teaching pack in Filipino, Cebuano, Hiligaynon, or another supported Philippine language, with Waray offered experimentally through Qwen-MT.**