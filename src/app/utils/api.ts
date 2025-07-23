export async function handleApiRequest<T>(
  requestFn: () => Promise<Response>,
  onSuccess: (data: T) => void,
  onError?: (error: string) => void
) {
  try {
    const response = await requestFn();

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      onSuccess(undefined as T);
      return;
    }

    const data: T = await response.json();
    onSuccess(data);
  } catch (err: unknown) {
    const message = err instanceof Error
      ? err.message
      : 'Unexpected error during API request.';
    onError?.(message);
    console.error('API request error:', err);
    throw err;
  }
}
