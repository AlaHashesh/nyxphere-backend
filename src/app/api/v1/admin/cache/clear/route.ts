import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/utils/withErrorHandler";
import { cache } from "@/lib/cache";

const handler = async (_: NextRequest) => {

  await cache.clear();

  return NextResponse.json({}, { status: 200 });
};

export const POST = withErrorHandler(handler);