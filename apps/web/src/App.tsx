import type {
  Language,
  LocalisationRequest,
  LocalisationResponse,
  Subject,
} from '@salinaral/contracts';
import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { ApiError, createLocalisation, listLanguages } from './api.js';

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
  const [error, setError] = useState<string>();
  const [languageNotice, setLanguageNotice] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      outputs: ['translation'],
    };

    setIsSubmitting(true);
    try {
      setResult(await createLocalisation(request));
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
              Add the lesson context and paste your source text. You’ll receive a translation to
              compare and review before classroom use.
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
            <div className="form-footer">
              <span
                id="character-count"
                className={
                  characterCount > 19_000 ? 'character-count near-limit' : 'character-count'
                }
              >
                {characterCount.toLocaleString()} / 20,000 characters
              </span>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Preparing draft…' : 'Prepare translation draft'}
              </button>
            </div>
            {error === undefined ? null : (
              <p className="error-message" role="alert">
                <strong>Draft not prepared.</strong> {error}
              </p>
            )}
          </section>
        </form>

        {result === undefined ? null : (
          <section className="result-section" aria-labelledby="result-heading">
            <div className="result-heading">
              <div>
                <h2 id="result-heading">Translation draft</h2>
                <p>Compare the meaning, names, numbers, and instructions with the source.</p>
              </div>
              <p className="review-label">
                <strong>AI-assisted draft</strong>
                <span>Review before classroom use</span>
              </p>
            </div>

            <div className="comparison">
              <article aria-labelledby="source-copy-heading">
                <h3 id="source-copy-heading">Source</h3>
                <p>{result.sourceText}</p>
              </article>
              <article aria-labelledby="translation-copy-heading">
                <h3 id="translation-copy-heading">Translation</h3>
                <p>{result.teachingPack.faithfulTranslation}</p>
              </article>
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
