/**
 * 認証フォームのプロパティ型
 */
export interface AuthFormProps {
  type: "login" | "signup";
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  isLoading: boolean;
  error?: string;
}
