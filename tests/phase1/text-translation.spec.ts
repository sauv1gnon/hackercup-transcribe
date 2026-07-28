import { LocaliseText, ProviderFailure, type TranslationProvider } from '@salinaral/application';
import { localisationRequestSchema } from '@salinaral/contracts';
import { createTranslationRequest, type LanguageCode } from '@salinaral/domain';
import { describe, expect, it } from 'vitest';

class FakeTranslationProvider implements TranslationProvider {
  public constructor(private readonly result: string | ProviderFailure) {}

  public supports(sourceLanguage: LanguageCode, targetLanguage: LanguageCode): boolean {
    return sourceLanguage !== targetLanguage;
  }

  public async translate(): Promise<string> {
    if (this.result instanceof ProviderFailure) {
      throw this.result;
    }
    return Promise.resolve(this.result);
  }
}

const requestBody = {
  sourceLanguage: 'en',
  targetLanguage: 'ceb',
  text: 'Plants use sunlight to produce food.',
  gradeLevel: 5,
  subject: 'science',
  outputs: ['translation'],
};

describe('Phase 1 text translation capability', () => {
  it('accepts the translation-only contract and returns a provider-neutral draft', async () => {
    const parsed = localisationRequestSchema.parse(requestBody);
    const request = createTranslationRequest(parsed);
    const useCase = new LocaliseText(
      new FakeTranslationProvider(
        'Ang mga tanom naggamit sa kahayag sa adlaw aron makahimo og pagkaon.',
      ),
    );

    await expect(useCase.execute(request)).resolves.toEqual({
      faithfulTranslation: 'Ang mga tanom naggamit sa kahayag sa adlaw aron makahimo og pagkaon.',
      provider: 'google',
    });
  });

  it('keeps provider failure details behind a stable application error', async () => {
    const request = createTranslationRequest(localisationRequestSchema.parse(requestBody));
    const useCase = new LocaliseText(new FakeTranslationProvider(new ProviderFailure('timeout')));

    await expect(useCase.execute(request)).rejects.toMatchObject({ code: 'timeout' });
  });
});
