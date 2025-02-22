import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/serverApp";
import { withErrorHandler } from "@/utils/withErrorHandler";
import { DocumentReference } from "@firebase/firestore";
import { getFullUrl } from "@/utils/media";

export const GET = withErrorHandler(async (_: NextRequest) => {
  const soundsCategoryRef = db.collection("categories").doc("ambients");
  const categoriesQuerySnapshot = await db.collection("categories")
    .where("parent", "==", soundsCategoryRef)
    .get();

  const categories = categoriesQuerySnapshot.docs.map(doc => {
    const category = doc.data();
    return {
      id: doc.id,
      sourceId: doc.id,
      title: category.title,
      language: "en",
      items: [],
      ambient: true
    };
  });

  if (categories.length == 0) {
    return NextResponse.json([], { status: 200 });
  }

  const categoryRefs = categoriesQuerySnapshot.docs.map(doc => doc.ref);
  const itemsQuerySnapshot = await db.collection("items")
    .where("categories", "array-contains-any", categoryRefs)
    .get();

  const items = itemsQuerySnapshot.docs.map((doc) => {
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
      audio: getFullUrl(item.audio),
      image: getFullUrl(item.image),
      free: item.free,
      ambient: true
    };
  });

  const ambients = categories.map(category => {
    const categoryItems = items.filter(item => item.audio != null && item.categoryIds?.includes(category.id));
    return {
      ...category,
      items: categoryItems
    };
  });

  const allCategories = [
    ...ambients
  ].filter(category => category.items.length > 0);

  return NextResponse.json(allCategories, { status: 200 });
});