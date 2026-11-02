export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
};

export type MfaChallenge = { challengeToken: string; expiresInSeconds: number };

export type UserSession = {
  userId: string;
  fullName: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
  branches: string[];
};

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = (configuredApiBaseUrl ?? (import.meta.env.DEV ? 'http://localhost:5001' : '')).replace(/\/$/, '');
const TOKENS_KEY = 'uplynk.auth.tokens';
const SESSION_KEY = 'uplynk.auth.session';
const BRANCH_KEY = 'uplynk.active-branch';
const BRANCH_NAME_KEY = 'uplynk.active-branch-name';

export async function apiRequest<T>(path: string, init: RequestInit = {}, authenticated = true): Promise<T> {
  if (!API_BASE_URL) throw new Error('The Uplynk API URL is not configured. Set VITE_API_BASE_URL for this deployment.');
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');

  if (authenticated) {
    const tokens = getTokens();
    if (!tokens) throw new Error('Your session has expired. Please sign in again.');
    headers.set('Authorization', `${tokens.tokenType || 'Bearer'} ${tokens.accessToken}`);
    const branchId = getActiveBranchId();
    if (branchId) headers.set('X-Branch-Id', branchId);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new Error(`Cannot reach the Uplynk API at ${API_BASE_URL}. Check the API URL and server status.`);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as {
      message?: string;
      title?: string;
      error?: { message?: string };
    } | null;
    throw new Error(payload?.error?.message ?? payload?.message ?? payload?.title ?? `Request failed (${response.status}).`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export type PageResult<T> = { data: T[]; meta: { total: number; page: number; limit: number } };

export function getPage<T>(path: string, q = ''): Promise<PageResult<T>> {
  const query = new URLSearchParams({ page: '1', limit: '100' });
  if (q.trim()) query.set('q', q.trim());
  return apiRequest<PageResult<T>>(`${path}${path.includes('?') ? '&' : '?'}${query}`);
}

export function getList<T>(path: string): Promise<T[]> {
  return apiRequest<T[]>(path);
}

export function createRecord<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export function updateRecord<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
}

export function getTokens(): AuthTokens | null {
  const value = sessionStorage.getItem(TOKENS_KEY);
  return value ? JSON.parse(value) as AuthTokens : null;
}

export function getSession(): UserSession | null {
  const value = sessionStorage.getItem(SESSION_KEY);
  return value ? JSON.parse(value) as UserSession : null;
}

export function getActiveBranchId(): string | null {
  return sessionStorage.getItem(BRANCH_KEY);
}

export function getActiveBranchName(): string | null {
  return sessionStorage.getItem(BRANCH_NAME_KEY);
}

export async function signIn(username: string, password: string): Promise<UserSession | MfaChallenge> {
  const result = await apiRequest<AuthTokens | MfaChallenge>(
    '/api/v1/auth/login',
    { method: 'POST', body: JSON.stringify({ username, password }) },
    false,
  );

  if ('challengeToken' in result) {
    return result;
  }

  return completeSignIn(result);
}

export async function verifyMfa(challengeToken: string, code: string): Promise<UserSession> {
  const tokens = await apiRequest<AuthTokens>('/api/v1/auth/mfa/verify', {
    method: 'POST',
    body: JSON.stringify({ challengeToken, code }),
  }, false);
  return completeSignIn(tokens);
}

async function completeSignIn(tokens: AuthTokens): Promise<UserSession> {
  sessionStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  try {
    const session = await apiRequest<UserSession>('/api/v1/auth/session', {}, true);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  } catch (error) {
    signOut();
    throw error;
  }
}

export function selectBranch(branchId: string, branchName?: string): void {
  sessionStorage.setItem(BRANCH_KEY, branchId);
  if (branchName) sessionStorage.setItem(BRANCH_NAME_KEY, branchName);
  else sessionStorage.removeItem(BRANCH_NAME_KEY);
}

export function signOut(): void {
  sessionStorage.removeItem(TOKENS_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(BRANCH_KEY);
  sessionStorage.removeItem(BRANCH_NAME_KEY);
}

export function hasSelectedBranch(): boolean {
  const branchId = getActiveBranchId();
  return Boolean(branchId && getSession()?.branches.includes(branchId));
}
