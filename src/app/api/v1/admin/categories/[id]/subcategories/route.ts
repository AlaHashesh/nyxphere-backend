import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/serverApp";
import { z } from "zod";
import { findById } from "@/app/services/categoryService";
import { withErrorHandler } from "@/utils/withErrorHandler";
import { BadRequestError } from "@/errors/BadRequestError";

type Props = {
  params: Promise<{ id: string }>;
};

const RequestPayloadScheme = z.object({
  id: z.string()
    .regex(/^[a-z-]+$/, "Only lowercase letters and dashes are allowed"),
  title: z.string().trim().min(1)
});

type RequestPayload = z.infer<typeof RequestPayloadScheme>;

export const GET = withErrorHandler(async (_: NextRequest, { params }: Props) => {
  const { id } = await params;
  const { ref } = await findById(id);
  const categoriesSnapShot = await db.collection("categories")
    .where("parent", "==", ref)
    .get();

  const categories = categoriesSnapShot.docs.map((doc) => {
    const category = doc.data();
    return {
      id: doc.id,
      title: category.title,
      parentId: id
    };
  });

  return NextResponse.json(categories, { status: 200 });
});

export const POST = withErrorHandler(async (req: NextRequest, { params }: Props) => {
  const { id } = await params;
  const { ref } = await findById(id);

  const payload: RequestPayload = await req.json();
  RequestPayloadScheme.parse(payload);

  const duplicateRef = db.collection("categories").doc(payload.id);
  const snapshot = await duplicateRef.get();
  if (snapshot.exists) {
    throw new BadRequestError("Category already exists");
  }

  const newDocument = {
    id: payload.id,
    title: payload.title
  };

  await duplicateRef.set({
    ...newDocument,
    parent: ref
  });

  return NextResponse.json(newDocument, { status: 200 });
});