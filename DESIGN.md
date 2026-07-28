---
name: SalinAral
description: A calm, teacher-controlled workspace for reviewing regional-language lesson drafts.
---

<!-- SEED: re-run $impeccable document once there's code to capture the actual tokens and components. -->

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

- **Oxidized Crimson** `[to be resolved during implementation]`: the generated warm-red seed anchors
  primary actions, current selection, and review-critical emphasis. It should occupy no more than
  ten percent of a typical screen.

### Neutral

- **True White** `[to be resolved during implementation]`: the primary reading and editing
  background, chosen for clear classroom-light legibility rather than decorative warmth.
- **Quiet Surface** `[to be resolved during implementation]`: a subtle neutral layer for toolbars,
  grouped controls, and comparison regions.
- **Lesson Ink** `[to be resolved during implementation]`: the high-contrast text color for source
  and generated lesson content.
- **Supporting Ink** `[to be resolved during implementation]`: secondary text that remains readable
  in bright ambient light.

**The Restrained Color Rule.** Oxidized crimson is functional and rare. Do not use it as ambient
decoration or tint every neutral surface toward warmth.

**The Meaning Beyond Color Rule.** Warnings, language maturity, selection, and review status always
include text or another non-color cue.

## Typography

Use a single humanist sans-serif family for lesson text, controls, labels, and headings. The exact
family and scale are `[to be resolved during implementation]` after representative Philippine
language content can be tested for character coverage and readability.

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
