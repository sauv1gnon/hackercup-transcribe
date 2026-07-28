---
name: SalinAral
description: A calm, teacher-controlled workspace for reviewing regional-language lesson drafts.
---

# Design System: SalinAral

## Overview

### Creative North Star: "The Teacher's Working Copy"

The physical scene is a teacher reviewing an annotated lesson plan on a bright classroom desk: clear
daylight, calm corrections, and material made to be handled rather than admired from a distance. The
interface should feel like a dependable working document with direct controls, not a conversation
with a machine.

Take direct editing and familiar document behavior from Google Docs, accessible form rigor from the
GOV.UK Design System, and the practical marks and corrections of a teacher-annotated Daily Lesson
Log. These are references for behavior and discipline, not templates to imitate.

Motion is responsive but restrained. Short transitions may confirm state changes, submission
progress, warnings, and completed actions; there is no orchestrated page-load choreography. Every
motion treatment must have a reduced-motion equivalent.

**Key Characteristics:**

- Bright, legible working surfaces
- Teacher-controlled editing and comparison
- Familiar controls with explicit states
- Quiet hierarchy around consequential review cues
- Humane language without assistant-first framing

## Colors

The palette is restrained: neutral working surfaces carry the lesson, while color communicates
action and state.

### Primary

- **Workbook Indigo** `oklch(0.36 0.17 270)`: anchors primary actions, visible focus, and the
  compact SalinAral mark. It should occupy no more than ten percent of a typical screen.
- **Correction Crimson** `oklch(0.43 0.16 25)`: is reserved for review-critical text and errors. It
  never acts as ambient decoration.

### Neutral

- **True White** `oklch(1 0 0)`: the primary reading and editing background, chosen for clear
  classroom-light legibility rather than decorative warmth.
- **Quiet Surface** `oklch(0.965 0.004 270)`: a subtle neutral layer for toolbars, grouped controls,
  and comparison regions.
- **Lesson Ink** `oklch(0.21 0.018 270)`: the high-contrast text color for source and generated
  lesson content.
- **Supporting Ink** `oklch(0.43 0.022 270)`: secondary text that remains readable in bright ambient
  light.

**The Restrained Color Rule.** Workbook indigo and correction crimson are functional and rare. Do
not use them as ambient decoration or tint every neutral surface.

**The Meaning Beyond Color Rule.** Warnings, language maturity, selection, and review status always
include text or another non-color cue.

## Typography

Use the system humanist sans-serif stack for lesson text, controls, labels, and headings. This keeps
loading light and provides broad character coverage on the teacher's device.

The type system should feel approachable without becoming casual. Use a compact product hierarchy,
comfortable paragraph leading, and a maximum prose measure of approximately 65–75 characters. Labels
remain in normal sentence case; display typography must not compete with the lesson.

**The One Reading Voice Rule.** Do not split lesson content and interface controls across competing
font personalities. Hierarchy comes from size, weight, spacing, and placement.

## Elevation

The system is flat by default. Separate controls, source text, and results through spacing, tonal
surface changes, and structure before introducing shadows. Temporary overlays may use restrained
structural elevation once their implemented behavior is known.

**The State-First Motion Rule.** Motion exists to explain feedback or state change, never to
decorate the workspace or stage the arrival of content.

## Do's and Don'ts

### Do

- **Do** keep source material, generated drafts, and teacher edits visually inspectable.
- **Do** use familiar document and form affordances with visible focus and complete keyboard states.
- **Do** display `AI-assisted draft—review before classroom use` with every generated result.
- **Do** preserve useful reading and editing space on phone-sized layouts.
- **Do** test type and layout with realistic English, Filipino, Cebuano, and Hiligaynon content.

### Don't

- **Don't** use an AI chatbot aesthetic, prompt-first layout, conversational assistant framing, or
  glowing AI motifs.
- **Don't** write assistant-first copy that gives SalinAral authority over the teacher.
- **Don't** distribute the workflow across decorative cards when direct document structure is
  clearer; never nest cards.
- **Don't** use gradient text, decorative glassmorphism, colored side-stripe callouts, or ornamental
  grid backgrounds.
- **Don't** imply guaranteed accuracy, official verification, improved learner outcomes, or
  Department of Education approval.
- **Don't** describe Philippine languages or regional languages as dialects.
