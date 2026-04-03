/**
 * APIクライアント用のカスタムエラークラス
 * HTTPステータスコードを保持し、呼び出し元で判別可能にします。
 */
export class ApiClientError extends Error {
  public status: number;
  public data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.data = data;

    // stack trace を保持 (Node.js/V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiClientError);
    }
  }
}
