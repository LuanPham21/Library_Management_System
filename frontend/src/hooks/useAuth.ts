import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/auth.service";
import { authStorage } from "../lib/config/auth.config";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export const useLogin = (p0: { onError: (err: Error) => void }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (dto: { email: string; password: string }) =>
      AuthService.login(dto).then((res) => res),

    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data);

      authStorage.setToken(data.accessToken);
      navigate("/dashboard");
    },

    onError: (error) => {
      console.error("Login failed:", error);

      p0.onError(error);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    onSettled: () => {
      queryClient.clear();
      authStorage.removeToken();
      navigate("/login");
    },
  });
};
