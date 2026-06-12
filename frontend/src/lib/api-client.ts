export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('X-Requested-With', 'XMLHttpRequest');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (response.status === 401 && endpoint !== '/auth/refreshtoken') {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => fetchWithAuth(endpoint, options))
        .catch(err => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refreshtoken`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });

      if (!refreshRes.ok) {
        throw new Error('Refresh token expired');
      }

      processQueue(null);
      // Retry original request
      return fetchWithAuth(endpoint, options);
    } catch (err) {
      processQueue(err);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-change'));
        if (window.location.pathname.startsWith('/dashboard')) {
          window.location.href = '/login';
        }
      }
      throw new Error('Unauthorized session. Please login again.');
    } finally {
      isRefreshing = false;
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'API request failed.');
  }

  return response.json();
}
