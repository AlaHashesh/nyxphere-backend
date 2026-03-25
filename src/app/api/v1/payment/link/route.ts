import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/utils/withErrorHandler";
import { z } from "zod";
import { getCustomerByEmail, getStripeClient } from "@/lib/stripe";
import { productIds, products } from "@/lib/constants";
import { BadRequestError } from "@/errors/BadRequestError";
import { getToken } from "@/lib/jwt";
import { linkAccessLevel } from "@/lib/adapty";
import Stripe from "stripe";

const RequestPayloadScheme = z.object({
  productId: z.enum(Object.values(productIds) as [string, ...string[]])
});

type RequestPayload = z.infer<typeof RequestPayloadScheme>;

const handler = async (req: NextRequest) => {

  const token = await getToken(req);
  const email = token?.email;
  if (email == undefined) {
    throw new BadRequestError("Invalid email");
  }

  const payload: RequestPayload = await req.json();
  RequestPayloadScheme.parse({
    ...payload
  });

  const product = products.find(product => product.id === payload.productId);
  if (product === undefined) {
    throw new BadRequestError("Product not found");
  }

  if (product.stripe.type === "subscription") {
    throw new BadRequestError("Linking subscriptions is not supported");
  } else {

    const customer = await getCustomerByEmail(email);
    const paymentIntents = await getStripeClient().paymentIntents.search({
      query: `customer:'${customer.id}' AND metadata['product_id']:'${product.id}' AND status:'succeeded'`,
      limit: 1,
      expand: ["data.latest_charge"]
    });

    if (paymentIntents.data.length == 0) {
      throw new BadRequestError("Payment intent not found");
    }

    const paymentIntent = paymentIntents.data[0];
    const latestCharge = paymentIntent.latest_charge as Stripe.Charge;
    const startsAt = new Date(latestCharge.created * 1000).toISOString();
    await linkAccessLevel(email, {
      access_level_id: "premium",
      starts_at: startsAt,
      expires_at: null
    });

    return NextResponse.json({}, { status: 200 });
  }
};

export const GET = withErrorHandler(handler);