import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase/serverApp";
import { withErrorHandler } from "@/utils/withErrorHandler";
import { withCacheableHandler } from "@/utils/withCacheableHandler";

const handler = async (_: NextRequest) => {
  const usersSnapShot = await db.collection("users")
    .limit(10)
    .get();
  const users = usersSnapShot.docs
    .map((doc) => {
      const user = doc.data();
      return {
        id: doc.id,
        ...(user.adaptyProfileId && { adaptyProfileId: user.adaptyProfileId }),
        ...(user.adaptyCustomerUserId && { adaptyCustomerUserId: user.adaptyCustomerUserId }),
        ...(user.isPremium && { isPremium: user.isPremium }),
        ...(user.promoCode && { promoCode: user.promoCode }),
      };
    });

  return NextResponse.json(users, { status: 200 });
};

export const GET = withErrorHandler(withCacheableHandler("admin.users", handler));