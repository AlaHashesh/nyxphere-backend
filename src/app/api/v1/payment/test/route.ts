import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/utils/withErrorHandler";
import { z } from "zod";
import { createOrGetCustomer, stripe } from "@/lib/stripe";
import { productIds, products } from "@/lib/constants";
import { BadRequestError } from "@/errors/BadRequestError";
import Stripe from "stripe";
import { getToken } from "@/lib/jwt";
import { getProfile, hasAccessLevel, linkAccessLevel } from "@/lib/adapty";

const RequestPayloadScheme = z.object({
  productId: z.enum(Object.values(productIds) as [string, ...string[]])
});

type RequestPayload = z.infer<typeof RequestPayloadScheme>;

async function createOrGetSubscription(customer: Stripe.Customer, priceId: string) {
  const existingSubscriptions = await stripe.subscriptions.list({
    customer: customer.id,
    price: priceId,
    expand: ["data.latest_invoice.payments"],
    limit: 1
  });

  if (existingSubscriptions.data.length > 0) {
    return existingSubscriptions.data[0];
  }

  return await stripe.subscriptions.create({
    customer: customer.id,
    items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.payments"],
    metadata: {
      customer_user_id: customer.email
    }
  });
}

const handler = async (req: NextRequest) => {

  return NextResponse.json({"test":"Hello"}, { status: 200 });
};

export const GET = withErrorHandler(handler);