import NextAuth from "next-auth";
import JWT from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    id: string;
    email: string;
    role: string;
    user: User
  }

  interface User {
    id: string;
    email: string;
    role: string;
    emailVerified: boolean | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: string;
    emailVerified: boolean | null;
  }
}