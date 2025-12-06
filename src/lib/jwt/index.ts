import {
  decode as jwtDecode,
  encode as jwtEncode,
  getToken as jwtGetToken,
  JWT,
  JWTEncodeParams
} from "@auth/core/jwt";
import { NextRequest } from "next/server";

const secret = process.env.AUTH_SECRET!;
const salt = process.env.NODE_ENV === "production" ? `__Secure-${process.env.AUTH_SALT}` : process.env.AUTH_SALT!;

export const encode = async (user: JWT) => {
  const jwtEncodeRequest = {
    secret: secret,
    salt: salt,
    token: user,
    maxAge: 1
  } as JWTEncodeParams;

  return await jwtEncode(jwtEncodeRequest);
};

export const decode = async (token: string | undefined) => {
  return await jwtDecode({
    secret: secret,
    salt: salt,
    token: token
  });
};

export const getToken = async (req: NextRequest) => {
  return await jwtGetToken({
    req, secret: process.env.AUTH_SECRET, decode: async (params) => {
      try {
        return await decode(params.token);
      } catch (error) {
        const e = error as {
          payload?: JWT;
          code?: string;
        };

        if (e && e.code && e.code === "ERR_JWT_EXPIRED") {
          const payload = e.payload;
          if (payload?.email != undefined) {
            return payload;
          }
        }

        return null;
      }
    }
  });
};