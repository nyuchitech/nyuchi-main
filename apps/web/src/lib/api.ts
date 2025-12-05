/**
 * 🇿🇼 API Client
 * "I am because we are"
 *
 * Production: https://api.nyuchi.com (Cloudflare Worker)
 * Development: http://localhost:8787 (wrangler dev)
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role?: string;
    ubuntu_score?: number;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

export async function signUp(data: SignUpData): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Signup failed');
  }

  return res.json();
}

export async function signIn(data: SignInData): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Sign in failed');
  }

  return res.json();
}

export async function signOut(token: string): Promise<void> {
  await fetch(`${API_URL}/api/auth/signout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
}
