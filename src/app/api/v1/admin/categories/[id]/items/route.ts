import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/serverApp";
import { z } from "zod";
import { findById } from "@/app/services/categoryService";
import { BadRequestError } from "@/errors/BadRequestError";
import { withErrorHandler } from "@/utils/withErrorHandler";

type Props = {
  params: Promise<{ id: string }>;
};

const RequestPayloadScheme = z.object({
  id: z.string()
    .regex(/^[a-z-]+$/, "Only lowercase letters and dashes are allowed"),
  title: z.string().trim().min(1),
  categoryIds: z.array(z.string().min(1)).min(1),
  audio: z.string().url(),
  icon: z.string().url(),
  free: z.boolean()
});

type RequestPayload = z.infer<typeof RequestPayloadScheme>;

export const GET = withErrorHandler(async (_: NextRequest, { params }: Props) => {
  const { id } = await params;
  const { ref } = await findById(id);

  const itemsSnapShot = await db.collection("items")
    .where("categories", "array-contains", ref)
    .get();

  const items = itemsSnapShot.docs.map((doc) => {
    const item = doc.data();
    return {
      id: doc.id,
      sourceId: doc.id,
      title: item.title,
      language: "en",
      categoryIds: item.categories ?? [],
      audio: item.audio,
      icon: item.icon,
      free: Boolean(item.free)
    };
  });

  return NextResponse.json(items, { status: 200 });
});

export const POST = withErrorHandler(async (req: NextRequest, { params }: Props) => {
  const { id } = await params;
  await findById(id);

  const payload: RequestPayload = await req.json();
  RequestPayloadScheme.parse(payload);

  const duplicateRef = db.collection("items").doc(payload.id);
  const duplicateSnapshot = await duplicateRef.get();
  if (duplicateSnapshot.exists) {
    throw new BadRequestError("Item already exists");
  }

  const categoryIds = payload.categoryIds;
  const categoriesSnapshot = await db.collection("items")
    .where("id", "array-contains-any", categoryIds)
    .get();

  const categories = categoriesSnapshot.docs;
  if (categories.length != categoryIds.length) {
    throw new BadRequestError("Selected categories are not valid");
  }

  if (categories.findIndex((doc) => doc.id === id) === -1) {
    throw new BadRequestError("You must select current category as well");
  }

  const newDocument = {
    ...payload
  };

  await duplicateRef.set({
    ...payload,
    categoryIds: undefined,
    categories: categories.map((doc) => doc.id)
  });

  return NextResponse.json(newDocument, { status: 200 });
});