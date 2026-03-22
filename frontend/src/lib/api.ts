const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

async function getAuthHeader() {
  const token = localStorage.getItem('auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function handleResponse(response: Response) {
  // Many endpoints (DELETE/PUT) return 204 No Content.
  if (response.status === 204) return null;

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const shaped = data as { error?: string; message?: string } | null;
    throw new Error(shaped?.error || shaped?.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  async get<T = unknown>(path: string): Promise<T> {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${API_URL}${path}`, {
      headers: { ...authHeader }
    });
    return handleResponse(res);
  },

  async post<T = unknown>(path: string, body: unknown): Promise<T> {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
      body: JSON.stringify(body)
    });
    return handleResponse(res);
  },

  async put<T = unknown>(path: string, body: unknown): Promise<T> {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${API_URL}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader
      },
      body: JSON.stringify(body)
    });
    return handleResponse(res);
  },

  async delete<T = unknown>(path: string): Promise<T> {
    const authHeader = await getAuthHeader();
    const res = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers: { ...authHeader }
    });
    return handleResponse(res);
  }
};

// Removed legacy fetchProducts/fetchProduct wrappers - moved directly to useProducts custom hook!
