export type LoginRequest = {
  provider: string;
  payload: {
    email: string;
    password: string;
    redirect?: boolean;
  }
}