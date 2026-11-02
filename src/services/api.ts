export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
};

export type UserSession = {
  userId: string;
  fullName: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
  branches: string[];
};

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = (configuredApiBaseUrl ?? (import.meta.env.DEV ? 'http://localhost:5000' : '')).replace(/\/$/, '');
const TOKENS_KEY = 'uplynk.auth.tokens';
const SESSION_KEY = 'uplynk.auth.session';
const BRANCH_KEY = 'uplynk.active-branch';

async function request<T>(path: string, init: RequestInit = {}, authenticated = false): Promise<T> {
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

export async function signIn(username: string, password: string): Promise<UserSession> {
  const result = await request<AuthTokens | { challengeToken: string }>(
    '/api/v1/auth/login',
    { method: 'POST', body: JSON.stringify({ username, password }) },
  );

  if ('challengeToken' in result) {
    throw new Error('This account requires multi-factor verification, which is not available in this frontend yet.');
  }

  sessionStorage.setItem(TOKENS_KEY, JSON.stringify(result));
  try {
    const session = await request<UserSession>('/api/v1/auth/session', {}, true);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  } catch (error) {
    signOut();
    throw error;
  }
}

export function selectBranch(branchId: string): void {
  sessionStorage.setItem(BRANCH_KEY, branchId);
}

export function signOut(): void {
  sessionStorage.removeItem(TOKENS_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(BRANCH_KEY);
}

export function hasSelectedBranch(): boolean {
  const branchId = getActiveBranchId();
  return Boolean(branchId && getSession()?.branches.includes(branchId));
}
