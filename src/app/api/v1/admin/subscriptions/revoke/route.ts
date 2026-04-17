import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/utils/withErrorHandler";
import { getProfile, revokeAccessLevel } from "@/lib/adapty";
import { z } from "zod";
import { BadRequestError } from "@/errors/BadRequestError";
import { cache } from "@/lib/cache";
import { db } from "@/lib/firebase/serverApp";

const RequestPayloadScheme = z.object({
  customerUserId: z.string().optional(),
  adaptyProfileId: z.string().optional(),
});

type RequestPayload = z.infer<typeof RequestPayloadScheme>;

const handler = async (req: NextRequest) => {

  const payload: RequestPayload = await req.json();
  RequestPayloadScheme.parse({
    ...payload
  });

  if (payload.customerUserId == undefined && payload.adaptyProfileId == undefined) {
    throw new BadRequestError("Invalid payload");
  }

  if (payload.customerUserId != undefined && payload.adaptyProfileId != undefined) {
    throw new BadRequestError("Only one of customerUserId or adaptyProfileId is required");
  }

  await revokeAccessLevel({
    customerUserId: payload.customerUserId,
    profileId: payload.adaptyProfileId
  }, {
    access_level_id: "premium"
  });

  const usersRef = db.collection("users");
  let query = usersRef.limit(1);

  if (payload.adaptyProfileId) {
    query = query.where("adaptyProfileId", "==", payload.adaptyProfileId);

  } else if (payload.customerUserId) {
    query = query.where("adaptyCustomerUserId", "==", payload.customerUserId);
  }

  const snapshot = await query.get();
  if (!snapshot.empty) {
    const data = snapshot.docs[0].data();
    await snapshot.docs[0].ref.update({
      ...data,
      isPremium: false,
      updatedAt: new Date().toISOString()
    });
  };

  await cache.del("admin.users");

  const profile = getProfile({
    customerUserId: payload.customerUserId,
    profileId: payload.adaptyProfileId
  });

  return NextResponse.json(profile, { status: 200 });
};

export const POST = withErrorHandler(handler);