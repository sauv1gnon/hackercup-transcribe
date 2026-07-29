import {
  createEducationalSections,
  DomainError,
  type EducationalSectionsInput,
  type GlossaryEntry,
  type ComprehensionQuestion,
  type LanguageCode,
  type TranslationRequest,
} from '@salinaral/domain';

export type ProviderFailureCode = 'timeout' | 'unavailable' | 'invalid_response';
export type ProviderAlias = 'google' | 'openai';

export class ProviderFailure extends Error {
  public override readonly name = 'ProviderFailure';

  public constructor(
    public readonly code: ProviderFailureCode,
    public readonly providerAlias: ProviderAlias = 'google',
  ) {
    super(code);
  }
}

export interface TranslationProvider {
  supports(sourceLanguage: LanguageCode, targetLanguage: LanguageCode): boolean;
  translate(request: TranslationRequest): Promise<string>;
}

export interface TranslationDraft {
  readonly faithfulTranslation: string;
  readonly provider: 'google';
}

export type OcrReviewCueKind =
  'low_confidence' | 'number' | 'date' | 'equation' | 'proper_noun' | 'scientific_term';

export interface OcrReviewCue {
  readonly kind: OcrReviewCueKind;
  readonly startOffset: number;
  readonly endOffset: number;
  readonly confidence?: number;
}

export interface OcrWarning {
  readonly code: 'low_ocr_confidence';
  readonly message: string;
}

export interface OcrExtraction {
  readonly extractedText: string;
  readonly reviewRequired: true;
  readonly reviewCues: readonly OcrReviewCue[];
  readonly warnings: readonly OcrWarning[];
}

export interface OcrInput {
  readonly buffer: Buffer;
  readonly mimeType: string;
  readonly originalSizeBytes: number;
  readonly width: number;
  readonly height: number;
}

export interface OcrProvider {
  extractText(buffer: Buffer): Promise<OcrExtraction>;
}

export type LocalisationOutputKind =
  'translation' | 'simplified_explanation' | 'glossary' | 'questions';

export interface EducationInput {
  readonly sourceText: string;
  readonly faithfulTranslation: string;
  readonly sourceLanguage: LanguageCode;
  readonly targetLanguage: LanguageCode;
  readonly gradeLevel: number;
  readonly subject: TranslationRequest['subject'];
}

export interface EducationAdapter {
  buildTeachingPack(input: EducationInput): Promise<EducationalSectionsInput>;
}

export interface TeachingPackDraft {
  readonly faithfulTranslation: string;
  readonly simplifiedExplanation?: string;
  readonly glossary?: readonly GlossaryEntry[];
  readonly questions?: readonly ComprehensionQuestion[];
}

export interface LocalisationDraft {
  readonly teachingPack: TeachingPackDraft;
  readonly translationProvider: 'google';
  readonly educationProvider?: 'openai';
}

export class ExtractTextFromImage {
  public constructor(private readonly provider: OcrProvider) {}

  public async execute(input: OcrInput): Promise<OcrExtraction> {
    const acceptedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

    if (!acceptedMimeTypes.has(input.mimeType)) {
      throw new DomainError('unsafe_image');
    }

    if (input.buffer.length === 0 || input.originalSizeBytes <= 0) {
      throw new DomainError('unsafe_image');
    }

    if (
      input.originalSizeBytes > 5 * 1024 * 1024 ||
      input.width <= 0 ||
      input.height <= 0 ||
      input.width > 4000 ||
      input.height > 4000
    ) {
      throw new DomainError('unsafe_image');
    }

    const extraction = await this.provider.extractText(input.buffer);
    const extractedText = extraction.extractedText
      .replaceAll('\r\n', '\n')
      .replaceAll('\r', '\n')
      .trim();

    if (extractedText.length === 0 || [...extractedText].length > 20_000) {
      throw new ProviderFailure('invalid_response', 'google');
    }

    return {
      ...extraction,
      extractedText,
      reviewRequired: true,
    };
  }
}

export class LocaliseText {
  public constructor(private readonly provider: TranslationProvider) {}

  public async execute(request: TranslationRequest): Promise<TranslationDraft> {
    if (!this.provider.supports(request.sourceLanguage, request.targetLanguage)) {
      throw new ProviderFailure('unavailable');
    }

    const faithfulTranslation = await this.provider.translate(request);

    if (faithfulTranslation.trim().length === 0 || faithfulTranslation.length > 30_000) {
      throw new ProviderFailure('invalid_response', 'google');
    }

    return {
      faithfulTranslation,
      provider: 'google',
    };
  }
}

export class LocaliseLesson {
  private readonly localiseText: LocaliseText;

  public constructor(
    translationProvider: TranslationProvider,
    private readonly educationAdapter: EducationAdapter,
  ) {
    this.localiseText = new LocaliseText(translationProvider);
  }

  public async execute(
    request: TranslationRequest,
    outputs: readonly LocalisationOutputKind[],
  ): Promise<LocalisationDraft> {
    const translation = await this.localiseText.execute(request);
    const educationalOutputRequested = outputs.some((output) => output !== 'translation');

    if (!educationalOutputRequested) {
      return {
        teachingPack: {
          faithfulTranslation: translation.faithfulTranslation,
        },
        translationProvider: translation.provider,
      };
    }

    const providerOutput = await this.educationAdapter.buildTeachingPack({
      sourceText: request.text,
      faithfulTranslation: translation.faithfulTranslation,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      gradeLevel: request.gradeLevel,
      subject: request.subject,
    });

    try {
      const educationalSections = createEducationalSections(providerOutput);
      return {
        teachingPack: {
          faithfulTranslation: translation.faithfulTranslation,
          ...(outputs.includes('simplified_explanation')
            ? { simplifiedExplanation: educationalSections.simplifiedExplanation }
            : {}),
          ...(outputs.includes('glossary') ? { glossary: educationalSections.glossary } : {}),
          ...(outputs.includes('questions') ? { questions: educationalSections.questions } : {}),
        },
        translationProvider: translation.provider,
        educationProvider: 'openai',
      };
    } catch (error: unknown) {
      if (error instanceof DomainError && error.code === 'invalid_educational_output') {
        throw new ProviderFailure('invalid_response', 'openai');
      }
      throw error;
    }
  }
}
