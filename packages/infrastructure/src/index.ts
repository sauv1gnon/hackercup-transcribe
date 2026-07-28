import { ProviderFailure, type TranslationProvider } from '@salinaral/application';
import { supportedLanguages, type LanguageCode, type TranslationRequest } from '@salinaral/domain';
import { GoogleAuth } from 'google-auth-library';

export interface RuntimeConfig {
  readonly nodeEnv: 'development' | 'test' | 'production';
  readonly port: number;
  readonly logLevel: 'info' | 'warn' | 'error';
  readonly corsAllowedOrigins: readonly string[];
  readonly googleCloudProject: string;
  readonly googleCloudLocation: string;
}

export interface OperationalEvent {
  readonly timestamp: string;
  readonly severity: 'info' | 'warn' | 'error';
  readonly service: 'salinaral-api';
  readonly version: '0.1.0';
  readonly requestId: string;
  readonly operation: 'health' | 'languages' | 'localisation';
  readonly duration: number;
  readonly resultCategory: string;
  readonly httpStatus: number;
  readonly providerAlias?: 'google';
  readonly sourceLanguage?: string;
  readonly targetLanguage?: string;
  readonly grade?: number;
  readonly subject?: string;
  readonly characterCount?: number;
}

export interface OperationalLogger {
  record(event: OperationalEvent): void;
}

export class ConsoleOperationalLogger implements OperationalLogger {
  public record(event: OperationalEvent): void {
    console.log(JSON.stringify(event));
  }
}

function requireValue(environment: NodeJS.ProcessEnv, name: string): string {
  const value = environment[name]?.trim();
  if (value === undefined || value.length === 0) {
    throw new Error(`Missing required runtime setting: ${name}`);
  }
  return value;
}

function isNodeEnvironment(value: string): value is RuntimeConfig['nodeEnv'] {
  return value === 'development' || value === 'test' || value === 'production';
}

function isLogLevel(value: string): value is RuntimeConfig['logLevel'] {
  return value === 'info' || value === 'warn' || value === 'error';
}

export function readRuntimeConfig(environment: NodeJS.ProcessEnv): RuntimeConfig {
  const nodeEnv = requireValue(environment, 'NODE_ENV');
  const logLevel = requireValue(environment, 'LOG_LEVEL');
  const port = Number(requireValue(environment, 'PORT'));
  const corsAllowedOrigins = requireValue(environment, 'CORS_ALLOWED_ORIGINS')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (!isNodeEnvironment(nodeEnv)) {
    throw new Error('NODE_ENV must be development, test, or production.');
  }

  if (!isLogLevel(logLevel)) {
    throw new Error('LOG_LEVEL must be info, warn, or error.');
  }

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be a valid port number.');
  }

  if (
    corsAllowedOrigins.length === 0 ||
    (nodeEnv === 'production' && corsAllowedOrigins.includes('*'))
  ) {
    throw new Error('CORS_ALLOWED_ORIGINS must contain explicit website addresses.');
  }

  return {
    nodeEnv,
    port,
    logLevel,
    corsAllowedOrigins,
    googleCloudProject: requireValue(environment, 'GOOGLE_CLOUD_PROJECT'),
    googleCloudLocation: requireValue(environment, 'GOOGLE_CLOUD_LOCATION'),
  };
}

function providerFailureFrom(error: unknown): ProviderFailure {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = Reflect.get(error, 'code');
    if (code === 4 || code === 'ETIMEDOUT' || code === 'ECONNABORTED') {
      return new ProviderFailure('timeout');
    }
    if (code === 8 || code === 14) {
      return new ProviderFailure('unavailable');
    }
  }
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = Reflect.get(error, 'response');
    if (typeof response === 'object' && response !== null && 'status' in response) {
      const status = Reflect.get(response, 'status');
      if (status === 408 || status === 504) {
        return new ProviderFailure('timeout');
      }
    }
  }
  return new ProviderFailure('unavailable');
}

function translatedTextFrom(response: unknown): string | undefined {
  if (typeof response !== 'object' || response === null || !('translations' in response)) {
    return undefined;
  }
  const translations = Reflect.get(response, 'translations');
  if (!Array.isArray(translations)) {
    return undefined;
  }
  const first = translations[0];
  if (typeof first !== 'object' || first === null || !('translatedText' in first)) {
    return undefined;
  }
  const translatedText = Reflect.get(first, 'translatedText');
  return typeof translatedText === 'string' ? translatedText : undefined;
}

export class GoogleTranslationProvider implements TranslationProvider {
  private readonly authentication = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-translation'],
  });

  public constructor(
    private readonly project: string,
    private readonly location: string,
  ) {}

  public supports(sourceLanguage: LanguageCode, targetLanguage: LanguageCode): boolean {
    const source = supportedLanguages.find((language) => language.code === sourceLanguage);
    const target = supportedLanguages.find((language) => language.code === targetLanguage);
    return source?.source === true && target?.target === true && sourceLanguage !== targetLanguage;
  }

  public async translate(request: TranslationRequest): Promise<string> {
    try {
      const client = await this.authentication.getClient();
      const response = await client.request<unknown>({
        url: `https://translation.googleapis.com/v3/projects/${encodeURIComponent(this.project)}/locations/${encodeURIComponent(this.location)}:translateText`,
        method: 'POST',
        data: {
          contents: [request.text],
          mimeType: 'text/plain',
          sourceLanguageCode: request.sourceLanguage,
          targetLanguageCode: request.targetLanguage,
        },
        timeout: 20_000,
      });
      const translatedText = translatedTextFrom(response.data);

      if (typeof translatedText !== 'string' || translatedText.trim().length === 0) {
        throw new ProviderFailure('invalid_response');
      }

      return translatedText;
    } catch (error: unknown) {
      if (error instanceof ProviderFailure) {
        throw error;
      }
      throw providerFailureFrom(error);
    }
  }
}
