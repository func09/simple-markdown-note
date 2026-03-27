import api from '@/lib/api';

/**
 * Hono RPC を使用した認証関連の API 通信
 */

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export const signin = async (data: { email: string; password: string }): Promise<AuthResponse> => {
  const res = await api.auth.signin.$post({ json: data });
  if (!res.ok) {
    const errorData = await res.json() as { error?: string };
    throw new Error(errorData.error || 'Login failed');
  }
  return res.json() as Promise<AuthResponse>;
};

export const signup = async (data: { email: string; password: string }): Promise<AuthResponse> => {
  const res = await api.auth.signup.$post({ json: data });
  if (!res.ok) {
    const errorData = await res.json() as { error?: string };
    throw new Error(errorData.error || 'Signup failed');
  }
  return res.json() as Promise<AuthResponse>;
};

export const logout = () => {
  localStorage.removeItem('token');
};

