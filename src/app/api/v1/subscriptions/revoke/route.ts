import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/utils/withErrorHandler";
import { revokeAccessLevel } from "@/lib/adapty";
import { z } from "zod";

const RequestPayloadScheme = z.object({
  customerUserId: z.string().min(1)
});

type RequestPayload = z.infer<typeof RequestPayloadScheme>;

const handler = async (req: NextRequest) => {

  // const token = await getToken(req);
  // const email = token?.email;
  // if (email == undefined) {
  //   throw new BadRequestError("Invalid email");
  // }
  //
  // const payload: RequestPayload = await req.json();
  // RequestPayloadScheme.parse({
  //   ...payload
  // });

  const payload = {
    customerUserId: "info@nyxphere.com"
  };

  const profile = await revokeAccessLevel(payload.customerUserId, {
    access_level_id: "premium"
  });

  return NextResponse.json(profile, { status: 200 });
};

export const GET = withErrorHandler(handler);