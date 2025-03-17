declare module "next-auth" {
  interface Session {
    id: string;
    email: string;
    role: string;
  }

  interface User {
    id: string;
    email: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: string;
  }
}