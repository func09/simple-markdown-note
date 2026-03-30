import api from "@/lib/api";

export const signin = async (data: any) => {
  const res = await api.auth.signin.$post({ json: data });
  return res;
};

export const signup = async (data: any) => {
  const res = await api.auth.signup.$post({ json: data });
  return res;
};

export const logout = async () => {
  localStorage.removeItem("token");
};
