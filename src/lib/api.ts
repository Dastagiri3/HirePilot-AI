const API_BASE = '/api';

export function getStoredToken(): string | null {
  return localStorage.getItem('hirepilot_token');
}

export function setStoredToken(token: string): void {
  localStorage.setItem('hirepilot_token', token);
}

export function removeStoredToken(): void {
  localStorage.removeItem('hirepilot_token');
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If unauthorized, clear token
    removeStoredToken();
  }

  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data.error) errorMsg = data.error;
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
}
