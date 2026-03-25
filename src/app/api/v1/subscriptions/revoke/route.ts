import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/utils/withErrorHandler";
import { getProfile } from "@/lib/adapty";
import { z } from "zod";
import { productIds, products } from "@/lib/constants";
import { BadRequestError } from "@/errors/BadRequestError";
import Stripe from "stripe";
import { getToken } from "@/lib/jwt";
import { createOrGetCustomer, getStripeClient } from "@/lib/stripe";

const RequestPayloadScheme = z.object({
  customerUserId: z.string().min(1)
});

type RequestPayload = z.infer<typeof RequestPayloadScheme>;

async function getSubscription(customer: Stripe.Customer, priceId: string) {
  const existingSubscriptions = await getStripeClient().subscriptions.list({
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

  const customer = await createOrGetCustomer(email);
  if (!customer) {
    throw new BadRequestError("Customer not found");
  }

  const product = products.find(product => product.id === productIds.Yearly);
  if (!product) {
    throw new BadRequestError("Product not found");
  }

  const subscription = await getSubscription(customer, product.stripe.priceId);
  if (!subscription) {
    throw new BadRequestError("Subscription not found");
  }

  if (subscription.cancel_at_period_end) {
    throw new BadRequestError("Subscription already cancelled");
  }

  const cancelledSubscription = await getStripeClient().subscriptions.update(subscription.id, {
    cancel_at_period_end: true
  });

  if (!cancelledSubscription.cancel_at_period_end) {
    throw new BadRequestError("Error canceling subscription");
  }

  const profile = await getProfile(email);
  return NextResponse.json(profile, { status: 200 });
};

export const POST = withErrorHandler(handler);