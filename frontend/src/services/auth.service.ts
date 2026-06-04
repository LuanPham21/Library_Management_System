import api from "../lib/config/axios.config";
import type { LoginPayload } from "../lib/dto/auth.dto";

export const AuthService = {
  login: async (payload: LoginPayload) => {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },

  profile: async () => {
    const { data } = await api.post("/auth/profile");
    return data;
  },
};
