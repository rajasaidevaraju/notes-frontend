export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function handleApiRequest<T>(
  requestFn: () => Promise<Response>,
  onSuccess: (data: T) => void,
  onError?: (error: string, statusCode?: number) => void
) {
  try {
    const response = await requestFn();

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      throw new ApiError(errorMessage, response.status);
    }

    if (response.status === 204) {
      onSuccess(undefined as T);
      return;
    }

    const data: T = await response.json();
    onSuccess(data);
  } catch (err: unknown) {
    let message = 'Unexpected error during API request.';
    let status: number | undefined;

    if (err instanceof ApiError) {
      message = err.message;
      status = err.status;
    } else if (err instanceof Error) {
      message = err.message;
    }

    onError?.(message, status);
    console.error('API request error:', err);

    // Rethrown as an ApiError so callers (and the global 401 handler) can read
    // the HTTP status, not just the message.
    throw err instanceof ApiError ? err : new ApiError(message, status);
  }
}
