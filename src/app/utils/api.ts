export async function handleApiRequest<T>(
  requestFn: () => Promise<Response>,
  onSuccess: (data: T) => void,
  onError?: (error: string, statusCode?: number) => void
) {
  try {
    const response = await requestFn();

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      throw new ErrorWithStatus(errorMessage, response.status);
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

    if (err instanceof ErrorWithStatus) {
      message = err.message;
      status = err.status;
    } else if (err instanceof Error) {
      message = err.message;
    }

    onError?.(message, status);
    console.error('API request error:', err);
    throw err;
  }
}

class ErrorWithStatus extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
