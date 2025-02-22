import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/serverApp";
import { z } from "zod";
import { findById } from "@/app/services/categoryService";
import { BadRequestError } from "@/errors/BadRequestError";
import { withErrorHandler } from "@/utils/withErrorHandler";
import { DocumentReference } from "@firebase/firestore";

type Props = {
  params: Promise<{ id: string }>;
};

const RequestPayloadScheme = z.object({
  id: z.string()
    .regex(/^[a-z-]+$/, "Only lowercase letters and dashes are allowed"),
  title: z.string().trim().min(1),
  categoryIds: z.array(z.string().min(1)).min(1),
  audio: z.string().min(1),
  icon: z.string().optional(),
  image: z.string().optional(),
  free: z.boolean(),
  categoryId: z.string().min(1),
  isNew: z.boolean().default(false),
  isAmbient: z.boolean(),
})
  .refine(data => {
    return !data.isAmbient || (data.isAmbient && !!data.image);
  }, {message: "image is required", path: ["image"]})
  .refine(data => {
    return data.isAmbient || (!data.isAmbient && !!data.icon);
  }, {message: "icon is required", path: ["icon"]});

type RequestPayload = z.infer<typeof RequestPayloadScheme>;

export const GET = withErrorHandler(async (_: NextRequest, { params }: Props) => {
  const { id } = await params;
  const { ref } = await findById(id);

  const itemsSnapShot = await db.collection("items")
    .where("categories", "array-contains", ref)
    .get();

  const items = itemsSnapShot.docs.map((doc) => {
    const item = doc.data();
    const categoryIds: string[] | undefined = item.categories?.map((categoryRef: DocumentReference) => {
      return categoryRef.id as string;
    });
    return {
      id: doc.id,
      sourceId: doc.id,
      title: item.title,
      language: "en",
      categoryIds: categoryIds ?? [],
      audio: item.audio,
      icon: item.icon,
      image: item.image,
      free: Boolean(item.free),
      categoryId: id,
      isNew: Boolean(item.isNew),
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
  const categoriesSnapshot = await db.collection("categories")
    .where("id", "in", categoryIds)
    .get();

  const categories = categoriesSnapshot.docs;
  if (categories.length != categoryIds.length) {
    throw new BadRequestError("Selected categories are not valid");
  }

  if (categories.findIndex((doc) => doc.id === id) === -1) {
    throw new BadRequestError("You must select current category as well");
  }

  const { categoryId, categoryIds: _, isAmbient, ...newDocument } = payload;

  await duplicateRef.set({
    ...newDocument,
    categories: categories.map((doc) => doc.ref)
  });

  return NextResponse.json(newDocument, { status: 200 });
});