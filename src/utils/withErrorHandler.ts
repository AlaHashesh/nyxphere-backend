import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { BadRequestError } from "@/errors/BadRequestError";

export function withErrorHandler(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          { errors: error.errors },
          { status: 400 }
        );
      }

      if (error instanceof BadRequestError) {
        return NextResponse.json(
          { message: error.message },
          { status: 400 }
        );
      }

      // Return a consistent error response
      return NextResponse.json(
        { message: (error as Error).message || "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}