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
