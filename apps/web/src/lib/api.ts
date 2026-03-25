import { hc } from 'hono/client';
import type { AppType } from 'api';

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
export const api = client as any;
export default api;
