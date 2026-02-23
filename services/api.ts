/**
 * Generic API service for making HTTP calls.
 * Configure base URL and use get/post/request for typed API calls.
 */

export interface ApiConfig {
  baseURL: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const DEFAULT_TIMEOUT_MS = 15000;

function getDefaultBaseURL(): string {
  // Production backend on Railway. For local dev, call configureApi({ baseURL: 'http://localhost:3000' }) in App.tsx.
  return 'https://gossipserver-production.up.railway.app';
}

let config: ApiConfig = {
  baseURL: getDefaultBaseURL(),
  timeoutMs: DEFAULT_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

export function configureApi(overrides: Partial<ApiConfig>): void {
  config = { ...config, ...overrides };
}

export function getApiConfig(): Readonly<ApiConfig> {
  return config;
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), ms)
  );
  return Promise.race([promise, timeout]);
}

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

/**
 * Low-level request. Use get() or post() for convenience.
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers: extraHeaders = {},
    timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  } = options;

  const url = path.startsWith('http') ? path : `${config.baseURL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    ...config.headers,
    ...extraHeaders,
  };

  const init: RequestInit = {
    method,
    headers,
  };
  if (body !== undefined && method !== 'GET') {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const response = await withTimeout(fetch(url, init), timeoutMs);
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  let data: unknown;
  try {
    data = isJson ? await response.json() : await response.text();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(
      (data as { message?: string })?.message ?? response.statusText ?? `HTTP ${response.status}`,
      response.status,
      data
    );
  }

  return data as T;
}

export function get<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
  return request<T>(path, { ...options, method: 'GET' });
}

export function post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
  return request<T>(path, { ...options, method: 'POST', body });
}

export function put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
  return request<T>(path, { ...options, method: 'PUT', body });
}

export function del<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
  return request<T>(path, { ...options, method: 'DELETE' });
}
