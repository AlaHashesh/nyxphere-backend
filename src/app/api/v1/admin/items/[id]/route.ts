import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withErrorHandler } from "@/utils/withErrorHandler";
import { findById } from "@/app/services/itemService";
import { db } from "@/lib/firebase/serverApp";
import { BadRequestError } from "@/errors/BadRequestError";

type Props = {
  params: Promise<{ id: string }>;
};

const RequestPayloadScheme = z.object({
  id: z.string()
    .regex(/^[a-z-]+$/, "Only lowercase letters and dashes are allowed"),
  title: z.string().trim().min(1),
  categoryIds: z.array(z.string().min(1)).min(1),
  audio: z.string().min(1),
  icon: z.string().min(1),
  free: z.boolean().default(false),
  categoryId: z.string().min(1),
  isAmbient: z.boolean(),
});

type RequestPayload = z.infer<typeof RequestPayloadScheme>;

export const POST = withErrorHandler(async (req: NextRequest, { params }: Props) => {
  const { id } = await params;
  const { ref } = await findById(id);

  const payload: RequestPayload = await req.json();
  RequestPayloadScheme.parse({
    ...payload,
    id: id
  });

  const categoryIds = payload.categoryIds;
  const categoriesSnapshot = await db.collection("categories")
    .where("id", "in", categoryIds)
    .get();

  const categories = categoriesSnapshot.docs;
  if (categories.length != categoryIds.length) {
    throw new BadRequestError("Selected categories are not valid");
  }

  if (categories.findIndex((doc) => doc.id === payload.categoryId) === -1) {
    throw new BadRequestError("You must select current category as well");
  }

  const { categoryId, categoryIds: _, isAmbient, ...newDocument } = payload;

  await ref.set({
    ...newDocument,
    id: id,
    categories: categories.map((doc) => doc.ref)
  });

  return NextResponse.json(newDocument, { status: 200 });
});