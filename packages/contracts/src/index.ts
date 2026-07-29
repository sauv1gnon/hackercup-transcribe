import { z } from 'zod';

export const languageCodeSchema = z
  .string()
  .min(2)
  .max(35)
  .regex(/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/);

export const languageStatusSchema = z.enum(['experimental', 'beta', 'stable']);

export const languageSchema = z.object({
  code: languageCodeSchema,
  name: z.string().min(1).max(80),
  source: z.boolean(),
  target: z.boolean(),
  status: languageStatusSchema,
});

export const languageListResponseSchema = z.object({
  languages: z.array(languageSchema).min(1),
});

export const subjectSchema = z.enum([
  'language',
  'mathematics',
  'science',
  'social_studies',
  'values_education',
  'other',
]);

export const outputKindSchema = z.enum([
  'translation',
  'simplified_explanation',
  'glossary',
  'questions',
]);

export const ocrReviewCueKindSchema = z.enum([
  'scientific_term',
  'low_ocr_confidence',
  'number',
  'date',
  'proper_noun',
]);

export const glossaryEntrySchema = z.object({
  sourceTerm: z.string().min(1).max(200),
  localisedTerm: z.string().min(1).max(200),
  explanation: z.string().min(1).max(1_000),
});

export const comprehensionQuestionSchema = z.object({
  type: z.enum(['recall', 'explanation', 'application']),
  question: z.string().min(1).max(1_000),
});

export const teachingPackSchema = z.object({
  faithfulTranslation: z.string().min(1).max(30_000),
  simplifiedExplanation: z.string().min(1).max(30_000).optional(),
  glossary: z.array(glossaryEntrySchema).min(1).max(50).optional(),
  questions: z.array(comprehensionQuestionSchema).min(3).max(5).optional(),
});

export const localisationRequestSchema = z.object({
  sourceLanguage: languageCodeSchema,
  targetLanguage: languageCodeSchema,
  text: z.string().min(1).max(20_000),
  gradeLevel: z.number().int().min(1).max(10),
  subject: subjectSchema,
  outputs: z
    .array(outputKindSchema)
    .min(1)
    .refine((outputs) => outputs.includes('translation')),
});

export const translationWarningSchema = z.object({
  code: z.enum([
    'number_changed',
    'measurement_changed',
    'date_changed',
    'name_missing',
    'formula_changed',
    'negation_changed',
    'terminology_review',
    'possible_omission',
    'low_ocr_confidence',
  ]),
  message: z.string().min(1).max(300),
});

export const localisationResponseSchema = z.object({
  requestId: z
    .string()
    .min(8)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/),
  sourceText: z.string().min(1).max(20_000),
  targetLanguage: languageCodeSchema,
  teachingPack: teachingPackSchema,
  provenance: z.object({
    translation: z.enum(['google', 'qwen']),
    education: z.enum(['openai']).nullable().optional(),
  }),
  reviewStatus: z.enum([
    'ai_generated',
    'teacher_edited',
    'native_speaker_reviewed',
    'community_verified',
  ]),
  warnings: z.array(translationWarningSchema),
});

export const ocrExtractionResponseSchema = z.object({
  requestId: z
    .string()
    .min(8)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/),
  extractedText: z.string().min(1).max(20_000),
  reviewRequired: z.boolean(),
  reviewCues: z
    .array(
      z.object({
        kind: ocrReviewCueKindSchema,
        startOffset: z.number().int().min(0),
        endOffset: z.number().int().min(0),
      }),
    )
    .max(50),
  warnings: z.array(z.string().min(1).max(300)),
});

export const problemSchema = z.object({
  type: z.string(),
  title: z.string().min(1).max(120),
  status: z.number().int().min(400).max(599),
  detail: z.string().min(1).max(300),
  requestId: z.string().min(8).max(64),
  errors: z
    .array(
      z.object({
        field: z.string().min(1).max(100),
        code: z.string().regex(/^[a-z][a-z0-9_]*$/),
      }),
    )
    .max(20)
    .optional(),
});

export type Language = z.infer<typeof languageSchema>;
export type LanguageListResponse = z.infer<typeof languageListResponseSchema>;
export type LocalisationRequest = z.infer<typeof localisationRequestSchema>;
export type LocalisationResponse = z.infer<typeof localisationResponseSchema>;
export type OcrExtractionResponse = z.infer<typeof ocrExtractionResponseSchema>;
export type Problem = z.infer<typeof problemSchema>;
export type Subject = z.infer<typeof subjectSchema>;
export type OutputKind = z.infer<typeof outputKindSchema>;
export type TeachingPack = z.infer<typeof teachingPackSchema>;
export type GlossaryEntry = z.infer<typeof glossaryEntrySchema>;
export type ComprehensionQuestion = z.infer<typeof comprehensionQuestionSchema>;
