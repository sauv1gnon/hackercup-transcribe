import {
  languageListResponseSchema,
  localisationResponseSchema,
  problemSchema,
  type LanguageListResponse,
  type LocalisationRequest,
  type LocalisationResponse,
} from '@salinaral/contracts';

const localApiBaseUrl = 'http://localhost:3000';

export class ApiError extends Error {
  public override readonly name = 'ApiError';

  public constructor(
    message: string,
    public readonly requestId?: string,
  ) {
    super(message);
  }
}

function apiBaseUrl(): string {
  const configured = window.__SALINARAL_CONFIG__?.PUBLIC_API_BASE_URL?.trim();
  return (
    configured === undefined || configured.length === 0 ? localApiBaseUrl : configured
  ).replace(/\/$/, '');
}

async function fetchWithDeadline(path: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 25_000);

  try {
    return await fetch(`${apiBaseUrl()}${path}`, {
      ...init,
      signal: controller.signal,
    });
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('The request took too long. Please try again.');
    }
    throw new ApiError('SalinAral could not reach the translation service. Please try again.');
  } finally {
    window.clearTimeout(timer);
  }
}

async function readError(response: Response): Promise<ApiError> {
  const parsed = problemSchema.safeParse(await response.json().catch(() => undefined));
  if (parsed.success) {
    return new ApiError(parsed.data.detail, parsed.data.requestId);
  }
  return new ApiError('No classroom draft was produced. Please try again.');
}

export async function listLanguages(): Promise<LanguageListResponse> {
  const response = await fetchWithDeadline('/api/v1/languages');
  if (!response.ok) {
    throw await readError(response);
  }

  const parsed = languageListResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new ApiError('The language list could not be checked. Please refresh the page.');
  }
  return parsed.data;
}

export async function createLocalisation(
  request: LocalisationRequest,
): Promise<LocalisationResponse> {
  const response = await fetchWithDeadline('/api/v1/localisations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw await readError(response);
  }

  const parsed = localisationResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new ApiError('The translation could not be checked. Please try again.');
  }
  return parsed.data;
}
