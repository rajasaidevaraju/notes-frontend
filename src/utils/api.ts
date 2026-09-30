export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, { credentials: 'include', ...init });
  } catch (err: unknown) {
    throw new ApiError(err instanceof Error ? err.message : 'Network request failed');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.error || `HTTP error! status: ${response.status}`, response.status);
  }

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new ApiError(
      `Expected JSON from ${url} but received "${contentType || 'no content-type'}"`,
      response.status
    );
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError(`Malformed JSON in response from ${url}`, response.status);
  }
}

export function apiSend<T>(url: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown): Promise<T> {
  return apiFetch<T>(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
