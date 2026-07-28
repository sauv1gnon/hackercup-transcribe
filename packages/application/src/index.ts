import type { LanguageCode, TranslationRequest } from '@salinaral/domain';

export type ProviderFailureCode = 'timeout' | 'unavailable' | 'invalid_response';

export class ProviderFailure extends Error {
  public override readonly name = 'ProviderFailure';

  public constructor(public readonly code: ProviderFailureCode) {
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

export class LocaliseText {
  public constructor(private readonly provider: TranslationProvider) {}

  public async execute(request: TranslationRequest): Promise<TranslationDraft> {
    if (!this.provider.supports(request.sourceLanguage, request.targetLanguage)) {
      throw new ProviderFailure('unavailable');
    }

    const faithfulTranslation = await this.provider.translate(request);

    if (faithfulTranslation.trim().length === 0 || faithfulTranslation.length > 30_000) {
      throw new ProviderFailure('invalid_response');
    }

    return {
      faithfulTranslation,
      provider: 'google',
    };
  }
}
