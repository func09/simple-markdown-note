/**
 * 認証フォームのプロパティ型
 */
export interface AuthFormProps {
  type: "login" | "signup";
  onSubmit: (data: { email: string; password: string }) => void;
  isLoading: boolean;
  error?: string;
}
