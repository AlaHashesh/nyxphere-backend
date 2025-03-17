import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function middleware(req: NextRequest) {
  const session = await auth();
  const user = session?.user;

  const isApiRoute = req.nextUrl.pathname.startsWith("/api");
  if (user?.role !== "admin") {
    if (isApiRoute) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*"
};
