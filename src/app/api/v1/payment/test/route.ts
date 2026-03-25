import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/utils/withErrorHandler";
import { z } from "zod";
import { createOrGetCustomer, stripe } from "@/lib/stripe";
import { productIds, products } from "@/lib/constants";
import { BadRequestError } from "@/errors/BadRequestError";
import Stripe from "stripe";
import { getToken } from "@/lib/jwt";
import { getProfile, hasAccessLevel, linkAccessLevel, revokeAccessLevel } from "@/lib/adapty";

const RequestPayloadScheme = z.object({
  productId: z.enum(Object.values(productIds) as [string, ...string[]])
});

type RequestPayload = z.infer<typeof RequestPayloadScheme>;

async function getSubscription(customer: Stripe.Customer, priceId: string) {
  const existingSubscriptions = await stripe.subscriptions.list({
    customer: customer.id,
    price: priceId,
    expand: ["data.latest_invoice.payments"],
    limit: 1
  });

  if (existingSubscriptions.data.length > 0) {
    return existingSubscriptions.data[0];
  }

  return undefined;
}

const cancelSubscription = async (email: string) => {
  const customer = await createOrGetCustomer(email);
  if (!customer) {
    return;
  }

  const product = products.find(product => product.id === productIds.Yearly);
  if (!product) {
    return;
  }

  const subscription = await getSubscription(customer, product.stripe.priceId);
  if (!subscription) {
    return;
  }

  if (subscription.status !== 'canceled') {
    await stripe.subscriptions.cancel(subscription.id);
  }
}

const handler = async (_: NextRequest) => {
  const email = "info@nyxphere.com";

  await cancelSubscription(email);
  await revokeAccessLevel(email, {
    access_level_id: "premium"
  });

  const profile = await getProfile(email);
  return NextResponse.json(profile, { status: 200 });
};

export const GET = withErrorHandler(handler);