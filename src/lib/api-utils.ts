/**
 * Safely parse JSON from a fetch Response
 * Handles empty responses, non-JSON content, and network errors
 */
export async function safeJsonParse<T = unknown>(res: Response): Promise<T> {
  // Check content type
  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(
      res.status === 0
        ? 'Network error. Is the backend server running on port 5000?'
        : res.status === 404
        ? 'Endpoint not found. Check your API route.'
        : `Expected JSON but got ${contentType || 'empty response'}. ${text.substring(0, 200)}`
    );
  }

  // Get response text
  const text = await res.text();
  
  // Check if empty
  if (!text || text.trim().length === 0) {
    throw new Error(
      res.status === 0
        ? 'Network error. Is the backend server running on port 5000?'
        : `Empty response from server (${res.status}). Is the backend running?`
    );
  }

  // Parse JSON
  try {
    return JSON.parse(text) as T;
  } catch (err) {
    throw new Error(
      `Invalid JSON response: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`
    );
  }
}
