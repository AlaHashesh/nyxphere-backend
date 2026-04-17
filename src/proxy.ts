import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { appCheck } from "@/lib/firebase/serverApp";

const allowedOrigins = [
  "https://backend.nyxphere.com",
  "https://admin.nyxphere.com",
  "http://localhost:3001",
];

export async function proxy(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get("Origin");
  let response = NextResponse.next();
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Firebase-AppCheck");
  }

  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return response;
  }

  const session = await auth();
  const user = session?.user;

  const isAdminApiRoute = req.nextUrl.pathname.startsWith("/api/admin");
  if (isAdminApiRoute && user?.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const isApiRoute = req.nextUrl.pathname.startsWith("/api");
  if (!isApiRoute) {
    return NextResponse.json({ message: "notFound" }, { status: 404 });
  }

  if (isAdminApiRoute) {
    return response;
  }

  // AppCheck
  // const appCheckToken = req.headers.get("X-Firebase-AppCheck");
  // if (!appCheckToken) {
  //   return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  // }
  //
  // try {
  //   await appCheck.verifyToken(appCheckToken);
  // } catch (error) {
  //   return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  // }

  return response;
}

export const config = {
  matcher: "/((?!favicon.ico|api/auth/login).*)"
};
