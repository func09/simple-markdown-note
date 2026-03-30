import api from "@/lib/api";

/**
 * 認証関連の純粋なAPI呼び出し（副作用なし）
 */
export const signin = async (data: any) => {
  const res = await api.auth.signin.$post({ json: data });
  return res;
};

export const signup = async (data: any) => {
  const res = await api.auth.signup.$post({ json: data });
  return res;
};
