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

  const adaptyProfile = await getProfile(email);
  if (hasAccessLevel(adaptyProfile)) {
    return NextResponse.json({
      premium: true
    }, { status: 200 });
  }

  const customer = await createOrGetCustomer(email);

  console.log(customer);
  if (product.stripe.type === "subscription") {
    const subscription = await createOrGetSubscription(customer, product.stripe.priceId);
    console.log(2, subscription);
    const invoice = subscription.latest_invoice;

    if (invoice == null || typeof invoice === "string") {
      throw new BadRequestError("Latest invoice not found");
    }

    const paymentIntentId = invoice.payments?.data?.[0]?.payment?.payment_intent;
    if (paymentIntentId == null || typeof paymentIntentId !== "string") {
      throw new BadRequestError("Payment intent not found");
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      premium: subscription.status === "active"
    }, { status: 200 });
  } else {

    const paymentIntents = await stripe.paymentIntents.search({
      query: `customer:'${customer.id}' AND metadata['product_id']:'${product.id}' AND status:'succeeded'`,
      limit: 1,
      expand: ["data.latest_charge"]
    });

    if (paymentIntents.data.length > 0) {
      const paymentIntent = paymentIntents.data[0];
      const latestCharge = paymentIntent.latest_charge as Stripe.Charge;
      await linkAccessLevel(email, {
        access_level_id: "premium",
        starts_at: new Date(latestCharge.created * 1000).toISOString(),
        expires_at: null
      });
      return NextResponse.json({
        premium: true
      }, { status: 200 });
    }

    const price = await stripe.prices.retrieve(product.stripe.priceId);
    const paymentIntent = await stripe.paymentIntents.create({
      customer: customer.id,
      amount: price.unit_amount ?? 999,
      currency: price.currency,
      metadata: {
        customer_user_id: customer.email,
        product_id: product.id
      }
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      premium: false
    }, { status: 200 });
  }

  return NextResponse.json({}, { status: 200 });
};

export const POST = withErrorHandler(handler);