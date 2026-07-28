export const supportedLanguages = [
  {
    code: 'en',
    name: 'English',
    source: true,
    target: true,
    status: 'experimental',
  },
  {
    code: 'fil',
    name: 'Filipino',
    source: true,
    target: true,
    status: 'experimental',
  },
  {
    code: 'ceb',
    name: 'Cebuano',
    source: false,
    target: true,
    status: 'experimental',
  },
  {
    code: 'hil',
    name: 'Hiligaynon',
    source: false,
    target: true,
    status: 'experimental',
  },
] as const;

export type LanguageCode = (typeof supportedLanguages)[number]['code'];
export type Subject =
  'language' | 'mathematics' | 'science' | 'social_studies' | 'values_education' | 'other';

export type DomainErrorCode =
  | 'empty_text'
  | 'text_too_large'
  | 'unsupported_language_pair'
  | 'same_language'
  | 'invalid_lesson_context';

export class DomainError extends Error {
  public override readonly name = 'DomainError';

  public constructor(public readonly code: DomainErrorCode) {
    super(code);
  }
}

export interface TranslationRequest {
  readonly sourceLanguage: LanguageCode;
  readonly targetLanguage: LanguageCode;
  readonly text: string;
  readonly gradeLevel: number;
  readonly subject: Subject;
}

export interface TranslationRequestInput {
  readonly sourceLanguage: string;
  readonly targetLanguage: string;
  readonly text: string;
  readonly gradeLevel: number;
  readonly subject: string;
}

const subjects = new Set<string>([
  'language',
  'mathematics',
  'science',
  'social_studies',
  'values_education',
  'other',
]);

function isLanguageCode(value: string): value is LanguageCode {
  return supportedLanguages.some((language) => language.code === value);
}

function isSourceLanguage(value: LanguageCode): boolean {
  return supportedLanguages.some((language) => language.code === value && language.source);
}

function isTargetLanguage(value: LanguageCode): boolean {
  return supportedLanguages.some((language) => language.code === value && language.target);
}

function isSubject(value: string): value is Subject {
  return subjects.has(value);
}

export function createTranslationRequest(input: TranslationRequestInput): TranslationRequest {
  const text = input.text.replaceAll('\r\n', '\n').replaceAll('\r', '\n').trim();

  if (text.length === 0) {
    throw new DomainError('empty_text');
  }

  if ([...text].length > 20_000) {
    throw new DomainError('text_too_large');
  }

  if (!isLanguageCode(input.sourceLanguage) || !isLanguageCode(input.targetLanguage)) {
    throw new DomainError('unsupported_language_pair');
  }

  if (!isSourceLanguage(input.sourceLanguage) || !isTargetLanguage(input.targetLanguage)) {
    throw new DomainError('unsupported_language_pair');
  }

  if (input.sourceLanguage === input.targetLanguage) {
    throw new DomainError('same_language');
  }

  if (
    !Number.isInteger(input.gradeLevel) ||
    input.gradeLevel < 1 ||
    input.gradeLevel > 10 ||
    !isSubject(input.subject)
  ) {
    throw new DomainError('invalid_lesson_context');
  }

  return {
    sourceLanguage: input.sourceLanguage,
    targetLanguage: input.targetLanguage,
    text,
    gradeLevel: input.gradeLevel,
    subject: input.subject,
  };
}
