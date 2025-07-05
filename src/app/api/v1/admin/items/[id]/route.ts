import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withErrorHandler } from "@/utils/withErrorHandler";
import { findById } from "@/app/services/itemService";
import { db } from "@/lib/firebase/serverApp";
import { BadRequestError } from "@/errors/BadRequestError";
import { cache } from "@/lib/cache";

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
  isAmbient: z.boolean()
})
  .refine(data => {
    return !data.isAmbient || (data.isAmbient && !!data.image);
  }, { message: "image is required", path: ["image"] })
  .refine(data => {
    return data.isAmbient || (!data.isAmbient && !!data.icon);
  }, { message: "icon is required", path: ["icon"] });

type RequestPayload = z.infer<typeof RequestPayloadScheme>;

const handler = async (req: NextRequest, { params }: Props) => {
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

  await cache.clear();
  return NextResponse.json(newDocument, { status: 200 });
};

export const POST = withErrorHandler(handler);