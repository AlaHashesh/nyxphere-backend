import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/utils/withErrorHandler";
import { getProfile, linkAccessLevel } from "@/lib/adapty";
import { z } from "zod";
import { BadRequestError } from "@/errors/BadRequestError";
import { db } from "@/lib/firebase/serverApp";
import { getSubscriptionCodes } from "@/app/services/appConfigService";
import { cache } from "@/lib/cache";

const RequestPayloadScheme = z.object({
  customerUserId: z.string().optional(),
  adaptyProfileId: z.string().optional(),
  code: z.string().min(1)
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

  const allowedCodes = await getSubscriptionCodes();
  if (!allowedCodes.includes(payload.code.trim().toLowerCase())) {
    throw new BadRequestError("Invalid subscription code");
  }

  const startsAt = new Date().toISOString();
  await linkAccessLevel({
    customerUserId: payload.customerUserId,
    profileId: payload.adaptyProfileId
  }, {
    access_level_id: "premium",
    starts_at: startsAt,
    expires_at: null
  });

  const usersRef = db.collection("users");
  let query = usersRef.limit(1);

  if (payload.adaptyProfileId) {
    query = query.where("adaptyProfileId", "==", payload.adaptyProfileId);

  } else if (payload.customerUserId) {
    query = query.where("adaptyCustomerUserId", "==", payload.customerUserId);
  }

  const snapshot = await query.get();

  const userData = {
    ...(payload.customerUserId && { adaptyCustomerUserId: payload.customerUserId }),
    ...(payload.adaptyProfileId && { adaptyProfileId: payload.adaptyProfileId }),
    isPremium: true,
    promoCode: payload.code
  };

  const date =  new Date().toISOString();
  if (!snapshot.empty) {
    await snapshot.docs[0].ref.update({
      ...userData,
      updatedAt: date
    });
  } else {
    await usersRef.add({
      ...userData,
      updatedAt: date,
      createdAt: date
    });
  }

  await cache.del("admin.users");

  const profile = getProfile({
    customerUserId: payload.customerUserId,
    profileId: payload.adaptyProfileId
  });

  await cache.del("admin.users");

  return NextResponse.json(profile, { status: 200 });
};

export const POST = withErrorHandler(handler);