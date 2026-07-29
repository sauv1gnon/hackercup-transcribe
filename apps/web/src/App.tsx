import type {
  ComprehensionQuestion,
  GlossaryEntry,
  Language,
  LocalisationRequest,
  LocalisationResponse,
  Subject,
} from '@salinaral/contracts';
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';

import { ApiError, createLocalisation, extractTextFromImage, listLanguages } from './api.js';

const initialLanguages: Language[] = [
  { code: 'en', name: 'English', source: true, target: true, status: 'experimental' },
  { code: 'fil', name: 'Filipino', source: true, target: true, status: 'experimental' },
  { code: 'ceb', name: 'Cebuano', source: false, target: true, status: 'experimental' },
  { code: 'hil', name: 'Hiligaynon', source: false, target: true, status: 'experimental' },
];

const subjects: { value: Subject; label: string }[] = [
  { value: 'language', label: 'Language' },
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
  { value: 'social_studies', label: 'Social studies' },
  { value: 'values_education', label: 'Values education' },
  { value: 'other', label: 'Other' },
];

const questionTypes: {
  value: ComprehensionQuestion['type'];
  label: string;
}[] = [
  { value: 'recall', label: 'Recall' },
  { value: 'explanation', label: 'Explanation' },
  { value: 'application', label: 'Application' },
];

interface EditableTeachingPack {
  readonly faithfulTranslation: string;
  readonly simplifiedExplanation: string;
  readonly glossary: readonly GlossaryEntry[];
  readonly questions: readonly ComprehensionQuestion[];
}

function statusLabel(status: Language['status']): string {
  if (status === 'stable') {
    return 'Stable';
  }
  if (status === 'beta') {
    return 'Beta';
  }
  return 'Early support';
}

export function App(): React.JSX.Element {
  const [languages, setLanguages] = useState<Language[]>(initialLanguages);
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('ceb');
  const [gradeLevel, setGradeLevel] = useState(5);
  const [subject, setSubject] = useState<Subject>('science');
  const [text, setText] = useState('');
  const [result, setResult] = useState<LocalisationResponse>();
  const [teachingPack, setTeachingPack] = useState<EditableTeachingPack>();
  const [teacherEdited, setTeacherEdited] = useState(false);
  const [error, setError] = useState<string>();
  const [languageNotice, setLanguageNotice] = useState<string>();
  const [ocrNotice, setOcrNotice] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    let active = true;
    void listLanguages()
      .then((response) => {
        if (active) {
          setLanguages(response.languages);
          setLanguageNotice(undefined);
        }
      })
      .catch(() => {
        if (active) {
          setLanguageNotice(
            'The live language list is unavailable. The planned Phase 1 languages are shown.',
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const sourceLanguages = useMemo(
    () => languages.filter((language) => language.source),
    [languages],
  );
  const targetLanguages = useMemo(
    () => languages.filter((language) => language.target && language.code !== sourceLanguage),
    [languages, sourceLanguage],
  );
  const characterCount = [...text].length;

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const nextFile = event.target.files?.[0] ?? null;
    setSelectedFile(nextFile);
    setOcrNotice(undefined);
  }

  async function handleImageExtract(): Promise<void> {
    if (selectedFile === null) {
      setError('Choose a JPEG, PNG, or WebP image to extract text.');
      return;
    }

    setError(undefined);
    setIsExtracting(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await extractTextFromImage(formData);
      setText(response.extractedText);
      setOcrNotice(
        response.reviewRequired ? 'The extracted text is ready for your review.' : undefined,
      );
    } catch (caught: unknown) {
      if (caught instanceof ApiError) {
        setError(caught.message);
      } else {
        setError('The image could not be processed. Please try again.');
      }
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);

    if (text.trim().length === 0) {
      setError('Paste the lesson text you want to localise.');
      return;
    }

    if (characterCount > 20_000) {
      setError('Shorten the lesson text to 20,000 characters or fewer.');
      return;
    }

    const request: LocalisationRequest = {
      sourceLanguage,
      targetLanguage,
      gradeLevel,
      subject,
      text,
      outputs: ['translation', 'simplified_explanation', 'glossary', 'questions'],
    };

    setIsSubmitting(true);
    try {
      const response = await createLocalisation(request);
      const { simplifiedExplanation, glossary, questions } = response.teachingPack;
      if (
        simplifiedExplanation === undefined ||
        glossary === undefined ||
        questions === undefined
      ) {
        throw new ApiError('The complete teaching pack could not be checked. Please try again.');
      }
      setResult(response);
      setTeachingPack({
        faithfulTranslation: response.teachingPack.faithfulTranslation,
        simplifiedExplanation,
        glossary: glossary.map((entry) => ({ ...entry })),
        questions: questions.map((question) => ({ ...question })),
      });
      setTeacherEdited(false);
    } catch (caught: unknown) {
      if (caught instanceof ApiError) {
        setError(
          caught.requestId === undefined
            ? caught.message
            : `${caught.message} Reference: ${caught.requestId}`,
        );
      } else {
        setError('No classroom draft was produced. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateTeachingPack(changes: Partial<EditableTeachingPack>): void {
    setTeachingPack((current) => (current === undefined ? current : { ...current, ...changes }));
    setTeacherEdited(true);
  }

  function updateGlossaryEntry(index: number, changes: Partial<GlossaryEntry>): void {
    if (teachingPack === undefined) {
      return;
    }
    updateTeachingPack({
      glossary: teachingPack.glossary.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, ...changes } : entry,
      ),
    });
  }

  function updateQuestion(index: number, changes: Partial<ComprehensionQuestion>): void {
    if (teachingPack === undefined) {
      return;
    }
    updateTeachingPack({
      questions: teachingPack.questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...changes } : question,
      ),
    });
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="/" aria-label="SalinAral home">
            <span className="brand-mark" aria-hidden="true">
              S
            </span>
            <span>SalinAral</span>
          </a>
          <p>Lesson localisation workspace</p>
        </div>
      </header>

      <main>
        <section className="intro" aria-labelledby="page-title">
          <div>
            <h1 id="page-title">Prepare a regional-language lesson draft</h1>
            <p>
              Add the lesson context and paste your source text. You’ll receive an editable teaching
              pack to compare and review before classroom use.
            </p>
          </div>
          <div className="privacy-note">
            <strong>Keep student information out.</strong>
            <span>Lesson text is used for this request and isn’t saved by SalinAral.</span>
          </div>
        </section>

        <form className="workspace" onSubmit={handleSubmit} noValidate>
          <section className="context-section" aria-labelledby="context-heading">
            <div className="section-heading">
              <h2 id="context-heading">Lesson context</h2>
              <p>These choices help keep the draft appropriate for your lesson.</p>
            </div>

            {languageNotice === undefined ? null : (
              <p className="notice" role="status">
                {languageNotice}
              </p>
            )}

            <div className="context-fields">
              <label>
                <span>Source language</span>
                <select
                  value={sourceLanguage}
                  onChange={(event) => {
                    const nextSource = event.target.value;
                    setSourceLanguage(nextSource);
                    if (nextSource === targetLanguage) {
                      const alternative = languages.find(
                        (language) => language.target && language.code !== nextSource,
                      );
                      if (alternative !== undefined) {
                        setTargetLanguage(alternative.code);
                      }
                    }
                  }}
                >
                  {sourceLanguages.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Target language</span>
                <select
                  value={targetLanguage}
                  onChange={(event) => setTargetLanguage(event.target.value)}
                >
                  {targetLanguages.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.name} — {statusLabel(language.status)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Grade level</span>
                <select
                  value={gradeLevel}
                  onChange={(event) => setGradeLevel(Number(event.target.value))}
                >
                  {Array.from({ length: 10 }, (_, index) => index + 1).map((grade) => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Subject</span>
                <select
                  value={subject}
                  onChange={(event) => {
                    const selected = subjects.find((item) => item.value === event.target.value);
                    if (selected !== undefined) {
                      setSubject(selected.value);
                    }
                  }}
                >
                  {subjects.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="text-section" aria-labelledby="source-heading">
            <div className="section-heading">
              <h2 id="source-heading">Source lesson text</h2>
              <p>Paragraph breaks will be kept in the draft.</p>
            </div>
            <label className="text-label" htmlFor="lesson-text">
              Lesson text
            </label>
            <textarea
              id="lesson-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={12}
              maxLength={20_000}
              placeholder="Paste the lesson passage or explanation here."
              aria-describedby="character-count"
              aria-invalid={error !== undefined}
            />
            <div className="section-heading">
              <h3>Extract from one worksheet image</h3>
              <p>Upload a JPEG, PNG, or WebP photo and review the OCR text before localising it.</p>
            </div>
            <label className="text-label" htmlFor="lesson-image">
              Worksheet image
            </label>
            <input
              id="lesson-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
            />
            <div className="form-footer">
              <span
                id="character-count"
                className={
                  characterCount > 19_000 ? 'character-count near-limit' : 'character-count'
                }
              >
                {characterCount.toLocaleString()} / 20,000 characters
              </span>
              <div className="action-row">
                <button
                  type="button"
                  onClick={() => {
                    void handleImageExtract();
                  }}
                  disabled={isExtracting}
                >
                  {isExtracting ? 'Extracting…' : 'Extract text from image'}
                </button>
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Preparing teaching pack…' : 'Prepare teaching pack'}
                </button>
              </div>
            </div>
            {ocrNotice === undefined ? null : (
              <p className="notice" role="status">
                {ocrNotice}
              </p>
            )}
            {error === undefined ? null : (
              <p className="error-message" role="alert">
                <strong>Draft not prepared.</strong> {error}
              </p>
            )}
          </section>
        </form>

        {result === undefined || teachingPack === undefined ? null : (
          <section className="result-section" aria-labelledby="result-heading">
            <div className="result-heading">
              <div>
                <h2 id="result-heading">Teaching pack draft</h2>
                <p>Compare every section with the source, then make the corrections you need.</p>
              </div>
              <div className="review-summary">
                <p className="review-label">
                  <strong>AI-assisted draft—review before classroom use.</strong>
                </p>
                <p className="edit-status" aria-live="polite">
                  {teacherEdited ? 'Teacher edited locally' : 'Not yet edited'}
                </p>
              </div>
            </div>

            <div className="result-workspace">
              <article className="source-copy" aria-labelledby="source-copy-heading">
                <h3 id="source-copy-heading">Source</h3>
                <p className="source-context">
                  Grade {gradeLevel} · {subjects.find((item) => item.value === subject)?.label}
                </p>
                <p>{result.sourceText}</p>
              </article>

              <div className="pack-editor" aria-label="Editable teaching pack">
                <section className="editor-section" aria-labelledby="translation-copy-heading">
                  <div className="editor-heading">
                    <h3 id="translation-copy-heading">Faithful translation</h3>
                    <span>Editable</span>
                  </div>
                  <label className="text-label" htmlFor="faithful-translation">
                    Faithful translation
                  </label>
                  <textarea
                    id="faithful-translation"
                    value={teachingPack.faithfulTranslation}
                    onChange={(event) =>
                      updateTeachingPack({ faithfulTranslation: event.target.value })
                    }
                    rows={8}
                  />
                </section>

                <section className="editor-section" aria-labelledby="explanation-heading">
                  <div className="editor-heading">
                    <h3 id="explanation-heading">Simplified explanation</h3>
                    <span>Editable</span>
                  </div>
                  <label className="text-label" htmlFor="simplified-explanation">
                    Simplified explanation
                  </label>
                  <textarea
                    id="simplified-explanation"
                    value={teachingPack.simplifiedExplanation}
                    onChange={(event) =>
                      updateTeachingPack({ simplifiedExplanation: event.target.value })
                    }
                    rows={7}
                  />
                </section>

                <fieldset className="editor-section">
                  <legend>Key-term glossary</legend>
                  <p className="section-help">Review each term and its classroom explanation.</p>
                  <div className="glossary-list">
                    {teachingPack.glossary.map((entry, index) => (
                      <div className="glossary-entry" key={`glossary-${index}`}>
                        <span className="entry-number" aria-hidden="true">
                          {index + 1}
                        </span>
                        <label>
                          <span>Source term</span>
                          <input
                            value={entry.sourceTerm}
                            onChange={(event) =>
                              updateGlossaryEntry(index, { sourceTerm: event.target.value })
                            }
                          />
                        </label>
                        <label>
                          <span>Localised term</span>
                          <input
                            value={entry.localisedTerm}
                            onChange={(event) =>
                              updateGlossaryEntry(index, { localisedTerm: event.target.value })
                            }
                          />
                        </label>
                        <label className="glossary-explanation">
                          <span>Simple explanation</span>
                          <textarea
                            value={entry.explanation}
                            onChange={(event) =>
                              updateGlossaryEntry(index, { explanation: event.target.value })
                            }
                            rows={3}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="editor-section">
                  <legend>Comprehension questions</legend>
                  <p className="section-help">
                    Keep at least one recall, explanation, and application question.
                  </p>
                  <div className="question-list">
                    {teachingPack.questions.map((question, index) => (
                      <div className="question-entry" key={`question-${index}`}>
                        <span className="entry-number" aria-hidden="true">
                          {index + 1}
                        </span>
                        <label>
                          <span>Question type</span>
                          <select
                            value={question.type}
                            onChange={(event) => {
                              const selected = questionTypes.find(
                                (item) => item.value === event.target.value,
                              );
                              if (selected !== undefined) {
                                updateQuestion(index, { type: selected.value });
                              }
                            }}
                          >
                            {questionTypes.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="question-text">
                          <span>Question</span>
                          <textarea
                            value={question.question}
                            onChange={(event) =>
                              updateQuestion(index, { question: event.target.value })
                            }
                            rows={3}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer>
        <p>
          SalinAral supports teacher review. It does not provide official verification or Department
          of Education approval.
        </p>
      </footer>
    </>
  );
}
