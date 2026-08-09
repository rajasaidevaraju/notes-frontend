export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Every API call goes through here. Resolves with the parsed body and throws an
 * ApiError on any failure, so callers can `const note = await apiFetch(...)`
 * and the global 401 handler in queryClient can read `error.status`.
 */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, { credentials: 'include', ...init });
  } catch (err: unknown) {
    // fetch only rejects on network-level failures; give those a status-less ApiError
    // so callers never have to distinguish them from HTTP errors.
    throw new ApiError(err instanceof Error ? err.message : 'Network request failed');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.error || `HTTP error! status: ${response.status}`, response.status);
  }

  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

/** apiFetch for the JSON-body verbs, so no call site hand-writes the header. */
export function apiSend<T>(url: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown): Promise<T> {
  return apiFetch<T>(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
