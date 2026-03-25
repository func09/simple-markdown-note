import api from '../../lib/api';

/**
 * Hono RPC を使用した認証関連の API 通信
 */

export const signin = async (data: any) => {
  const res = await api.auth.signin.$post({ json: data });
  if (!res.ok) {
    const errorData: any = await res.json();
    throw new Error(errorData.error || 'Login failed');
  }
  return res.json();
};

export const signup = async (data: any) => {
  const res = await api.auth.signup.$post({ json: data });
  if (!res.ok) {
    const errorData: any = await res.json();
    throw new Error(errorData.error || 'Signup failed');
  }
  return res.json();
};

export const logout = () => {
  localStorage.removeItem('token');
};

