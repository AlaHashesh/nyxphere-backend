import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/serverApp";
import { withErrorHandler } from "@/utils/withErrorHandler";

export const GET = withErrorHandler(async (_: NextRequest) => {
  const categoriesSnapShot = await db.collection("categories")
    .get();
  const categories = categoriesSnapShot.docs
    .filter(doc => {
      const data = doc.data();
      return !data.parent;
    })
    .map((doc) => {
      const category = doc.data();
      return {
        id: doc.id,
        title: String(category.title)
      };
    });

  return NextResponse.json(categories, { status: 200 });
});