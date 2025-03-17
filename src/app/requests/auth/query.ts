import { useMutation } from "@tanstack/react-query";
import { LoginRequest } from "./types";
import { login } from "./api";

export const useLogin = () => {
  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      return login(payload);
    }
  });
};