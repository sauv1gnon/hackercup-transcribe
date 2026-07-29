import {
  LocaliseLesson,
  type EducationAdapter,
  type TranslationProvider,
} from '@salinaral/application';
import { createTranslationRequest, type LanguageCode } from '@salinaral/domain';
import { describe, expect, it } from 'vitest';

class FakeTranslationProvider implements TranslationProvider {
  public supports(sourceLanguage: LanguageCode, targetLanguage: LanguageCode): boolean {
    return sourceLanguage !== targetLanguage;
  }

  public translate(): Promise<string> {
    return Promise.resolve('Ang mga tanom naggamit sa kahayag sa adlaw aron makahimo og pagkaon.');
  }
}

class FakeEducationAdapter implements EducationAdapter {
  public calls = 0;

  public constructor(private readonly invalid = false) {}

  public buildTeachingPack(): Promise<{
    simplifiedExplanation: string;
    glossary: readonly {
      sourceTerm: string;
      localisedTerm: string;
      explanation: string;
    }[];
    questions: readonly {
      type: 'recall' | 'explanation' | 'application';
      question: string;
    }[];
  }> {
    this.calls += 1;
    return Promise.resolve({
      simplifiedExplanation:
        'Ang tanom nagkinahanglan og kahayag sa adlaw aron makahimo sa iyang pagkaon.',
      glossary: [
        {
          sourceTerm: 'sunlight',
          localisedTerm: 'kahayag sa adlaw',
          explanation: 'Kahayag nga gikan sa adlaw.',
        },
      ],
      questions: [
        { type: 'recall', question: 'Unsa ang gigamit sa tanom?' },
        { type: 'explanation', question: 'Ngano nga importante ang kahayag?' },
        {
          type: this.invalid ? 'recall' : 'application',
          question: 'Unsay mahitabo kon walay kahayag?',
        },
      ],
    });
  }
}

const request = createTranslationRequest({
  sourceLanguage: 'en',
  targetLanguage: 'ceb',
  text: 'Plants use sunlight to produce food.',
  gradeLevel: 5,
  subject: 'science',
});

describe('Phase 2 educational output', () => {
  it('creates a complete teaching pack through provider-neutral ports', async () => {
    const education = new FakeEducationAdapter();
    const useCase = new LocaliseLesson(new FakeTranslationProvider(), education);

    const result = await useCase.execute(request, [
      'translation',
      'simplified_explanation',
      'glossary',
      'questions',
    ]);

    expect(result.teachingPack.simplifiedExplanation).toBeTruthy();
    expect(result.teachingPack.glossary).toHaveLength(1);
    expect(result.teachingPack.questions?.map((question) => question.type)).toEqual([
      'recall',
      'explanation',
      'application',
    ]);
    expect(result.educationProvider).toBe('openai');
  });

  it('keeps translation-only requests independent of OpenAI', async () => {
    const education = new FakeEducationAdapter();
    const useCase = new LocaliseLesson(new FakeTranslationProvider(), education);

    const result = await useCase.execute(request, ['translation']);

    expect(education.calls).toBe(0);
    expect(result.teachingPack.simplifiedExplanation).toBeUndefined();
    expect(result.educationProvider).toBeUndefined();
  });

  it('maps invalid educational output to a stable provider failure', async () => {
    const useCase = new LocaliseLesson(
      new FakeTranslationProvider(),
      new FakeEducationAdapter(true),
    );

    await expect(
      useCase.execute(request, ['translation', 'simplified_explanation', 'glossary', 'questions']),
    ).rejects.toMatchObject({
      code: 'invalid_response',
      providerAlias: 'openai',
    });
  });
});
