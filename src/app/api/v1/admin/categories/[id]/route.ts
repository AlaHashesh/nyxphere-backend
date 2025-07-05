import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withErrorHandler } from "@/utils/withErrorHandler";
import { findById } from "@/app/services/categoryService";

type Props = {
  params: Promise<{ id: string }>;
};

const RequestPayloadScheme = z.object({
  id: z.string(),
  title: z.string().trim().min(1)
});

type RequestPayload = z.infer<typeof RequestPayloadScheme>;

const handler = async (req: NextRequest, { params }: Props) => {
  const { id } = await params;
  const { ref, snapshot } = await findById(id);

  const payload: RequestPayload = await req.json();
  RequestPayloadScheme.parse({
    ...payload,
    id: id
  });

  await ref.set({
    ...snapshot.data(),
    id: id,
    title: payload.title
  });

  const newDocument = {
    id: id,
    title: payload.title
  };
  return NextResponse.json(newDocument, { status: 200 });
};

export const POST = withErrorHandler(handler);