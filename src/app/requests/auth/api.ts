import { LoginRequest } from "./types";
import { signIn } from "next-auth/react";

export const login = (loginRequest: LoginRequest) => {
  return signIn(loginRequest.provider, loginRequest.payload);
};