import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { LocaliseLesson, ProviderFailure } from '@salinaral/application';
import {
  localisationRequestSchema,
  type LocalisationResponse,
  type Problem,
} from '@salinaral/contracts';
import { createTranslationRequest, DomainError, supportedLanguages } from '@salinaral/domain';
import {
  ConsoleOperationalLogger,
  GoogleTranslationProvider,
  OpenAIEducationAdapter,
  type OperationalEvent,
  type OperationalLogger,
  type RuntimeConfig,
} from '@salinaral/infrastructure';
import Fastify, { type FastifyInstance, type FastifyReply } from 'fastify';
import { randomUUID } from 'node:crypto';

function requestId(): string {
  return `req_${randomUUID().replaceAll('-', '')}`;
}

function createProblem(
  requestIdentifier: string,
  status: number,
  slug: string,
  title: string,
  detail: string,
  errors?: Problem['errors'],
): Problem {
  const base = {
    type: `urn:salinaral:problem:${slug}`,
    title,
    status,
    detail,
    requestId: requestIdentifier,
  };
  return errors === undefined ? base : { ...base, errors };
}

function sendProblem(reply: FastifyReply, problem: Problem): void {
  void reply.status(problem.status).type('application/problem+json').send(problem);
}

function record(
  logger: OperationalLogger,
  event: Omit<OperationalEvent, 'timestamp' | 'service' | 'version'>,
): void {
  logger.record({
    timestamp: new Date().toISOString(),
    service: 'salinaral-api',
    version: '0.1.0',
    ...event,
  });
}

function domainProblem(error: DomainError, identifier: string): Problem {
  if (error.code === 'text_too_large') {
    return createProblem(
      identifier,
      413,
      'content-too-large',
      'Content too large',
      'Shorten the lesson text and try again.',
    );
  }

  if (error.code === 'unsupported_language_pair' || error.code === 'same_language') {
    return createProblem(
      identifier,
      422,
      'unsupported-language-pair',
      'Language pair not supported',
      'Choose different source and target languages shown as supported.',
    );
  }

  return createProblem(
    identifier,
    400,
    'invalid-request',
    'Check the lesson details',
    'Review the marked fields and try again.',
  );
}

function providerProblem(error: ProviderFailure, identifier: string): Problem {
  if (error.code === 'timeout') {
    return createProblem(
      identifier,
      504,
      'provider-timeout',
      'Request timed out',
      'No classroom draft was produced. Try again.',
    );
  }

  if (error.code === 'invalid_response') {
    return createProblem(
      identifier,
      502,
      'invalid-provider-response',
      'Result could not be checked',
      'No classroom draft was produced. Try again later.',
    );
  }

  return createProblem(
    identifier,
    503,
    'service-unavailable',
    error.providerAlias === 'openai'
      ? 'Lesson drafting is temporarily unavailable'
      : 'Translation is temporarily unavailable',
    'Try again later.',
  );
}

function errorStatus(error: unknown): number | undefined {
  if (typeof error === 'object' && error !== null && 'statusCode' in error) {
    const statusCode = Reflect.get(error, 'statusCode');
    return typeof statusCode === 'number' ? statusCode : undefined;
  }
  return undefined;
}

export async function buildApp(
  config: RuntimeConfig,
  logger: OperationalLogger = new ConsoleOperationalLogger(),
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false,
    bodyLimit: 80_000,
    requestTimeout: 55_000,
    genReqId: requestId,
  });

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  });
  await app.register(cors, {
    origin: [...config.corsAllowedOrigins],
    credentials: false,
  });
  await app.register(rateLimit, {
    max: 60,
    timeWindow: '1 minute',
  });

  app.setErrorHandler((error, request, reply) => {
    const status = errorStatus(error) === 429 ? 429 : 500;
    const routeUrl = request.routeOptions.url ?? '';
    const problem =
      status === 429
        ? createProblem(
            request.id,
            429,
            'rate-limited',
            'Too many requests',
            'Wait before trying again.',
          )
        : createProblem(request.id, 500, 'internal', 'Something went wrong', 'Try again later.');

    record(logger, {
      severity: status === 429 ? 'warn' : 'error',
      requestId: request.id,
      operation: routeUrl.includes('localisations')
        ? 'localisation'
        : routeUrl.includes('languages')
          ? 'languages'
          : 'health',
      duration: 0,
      resultCategory: status === 429 ? 'rate_limited' : 'internal_error',
      httpStatus: status,
    });
    sendProblem(reply, problem);
  });

  app.get('/api/v1/health', async (request, reply) => {
    const started = performance.now();
    reply.header('X-Request-Id', request.id);
    record(logger, {
      severity: 'info',
      requestId: request.id,
      operation: 'health',
      duration: Math.round(performance.now() - started),
      resultCategory: 'success',
      httpStatus: 200,
    });
    return {
      status: 'ok',
      service: 'salinaral-api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    };
  });

  app.get('/api/v1/languages', async (request, reply) => {
    const started = performance.now();
    reply.header('X-Request-Id', request.id);
    record(logger, {
      severity: 'info',
      requestId: request.id,
      operation: 'languages',
      duration: Math.round(performance.now() - started),
      resultCategory: 'success',
      httpStatus: 200,
    });
    return { languages: supportedLanguages };
  });

  const localiseLesson = new LocaliseLesson(
    new GoogleTranslationProvider(config.googleCloudProject, config.googleCloudLocation),
    new OpenAIEducationAdapter(config.openAiApiKey),
  );

  app.post(
    '/api/v1/localisations',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
    },
    async (request, reply) => {
      const started = performance.now();
      reply.header('X-Request-Id', request.id);
      const parsed = localisationRequestSchema.safeParse(request.body);

      if (!parsed.success) {
        const errors = parsed.error.issues.slice(0, 20).map((issue) => ({
          field: issue.path.join('.') || 'request',
          code: 'invalid_value',
        }));
        const problem = createProblem(
          request.id,
          400,
          'invalid-request',
          'Check the lesson details',
          'Review the marked fields and try again.',
          errors,
        );
        record(logger, {
          severity: 'warn',
          requestId: request.id,
          operation: 'localisation',
          duration: Math.round(performance.now() - started),
          resultCategory: 'invalid_request',
          httpStatus: 400,
        });
        sendProblem(reply, problem);
        return;
      }

      let translationRequest;
      try {
        translationRequest = createTranslationRequest(parsed.data);
      } catch (error: unknown) {
        if (error instanceof DomainError) {
          const problem = domainProblem(error, request.id);
          record(logger, {
            severity: 'warn',
            requestId: request.id,
            operation: 'localisation',
            duration: Math.round(performance.now() - started),
            resultCategory: error.code,
            httpStatus: problem.status,
            sourceLanguage: parsed.data.sourceLanguage,
            targetLanguage: parsed.data.targetLanguage,
            grade: parsed.data.gradeLevel,
            subject: parsed.data.subject,
            characterCount: [...parsed.data.text].length,
          });
          sendProblem(reply, problem);
          return;
        }
        throw error;
      }

      try {
        const draft = await localiseLesson.execute(translationRequest, parsed.data.outputs);
        const response: LocalisationResponse = {
          requestId: request.id,
          sourceText: translationRequest.text,
          targetLanguage: translationRequest.targetLanguage,
          teachingPack: {
            faithfulTranslation: draft.teachingPack.faithfulTranslation,
            ...(draft.teachingPack.simplifiedExplanation === undefined
              ? {}
              : { simplifiedExplanation: draft.teachingPack.simplifiedExplanation }),
            ...(draft.teachingPack.glossary === undefined
              ? {}
              : {
                  glossary: draft.teachingPack.glossary.map((entry) => ({
                    sourceTerm: entry.sourceTerm,
                    localisedTerm: entry.localisedTerm,
                    explanation: entry.explanation,
                  })),
                }),
            ...(draft.teachingPack.questions === undefined
              ? {}
              : {
                  questions: draft.teachingPack.questions.map((question) => ({
                    type: question.type,
                    question: question.question,
                  })),
                }),
          },
          provenance: {
            translation: draft.translationProvider,
            ...(draft.educationProvider === undefined
              ? {}
              : { education: draft.educationProvider }),
          },
          reviewStatus: 'ai_generated',
          warnings: [],
        };
        record(logger, {
          severity: 'info',
          requestId: request.id,
          operation: 'localisation',
          duration: Math.round(performance.now() - started),
          resultCategory: 'success',
          httpStatus: 200,
          providerAlias: draft.educationProvider ?? draft.translationProvider,
          sourceLanguage: translationRequest.sourceLanguage,
          targetLanguage: translationRequest.targetLanguage,
          grade: translationRequest.gradeLevel,
          subject: translationRequest.subject,
          characterCount: [...translationRequest.text].length,
        });
        return response;
      } catch (error: unknown) {
        if (error instanceof ProviderFailure) {
          const problem = providerProblem(error, request.id);
          record(logger, {
            severity: 'warn',
            requestId: request.id,
            operation: 'localisation',
            duration: Math.round(performance.now() - started),
            resultCategory: error.code,
            httpStatus: problem.status,
            providerAlias: error.providerAlias,
            sourceLanguage: translationRequest.sourceLanguage,
            targetLanguage: translationRequest.targetLanguage,
            grade: translationRequest.gradeLevel,
            subject: translationRequest.subject,
            characterCount: [...translationRequest.text].length,
          });
          sendProblem(reply, problem);
          return;
        }
        throw error;
      }
    },
  );

  return app;
}
