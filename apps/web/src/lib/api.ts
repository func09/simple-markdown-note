import type { AppType } from 'api';
import { hc } from 'hono/client';

// Hono RPCクライアントの初期化
// ブラウザからのリクエストは proxy 設定によって /api に転送されるため、
// ベースURLを /api に設定します。
const client = hc<AppType>('/api', {
  headers: () => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }
});

// 認証トークンの付与などのためのラッパーやインターセプターが必要な場合は
// ここで拡張できますが、Hono hc は fetch をベースにしています。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const api = client as any;
export default api;
