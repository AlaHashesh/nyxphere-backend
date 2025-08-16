import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/utils/withErrorHandler";
import { z } from "zod";
import { stripe } from "@/lib/stripe";
import { productIds, products } from "@/lib/constants";
import { BadRequestError } from "@/errors/BadRequestError";
import Stripe from "stripe";
import { decode, getToken, JWT } from "@auth/core/jwt";

const RequestPayloadScheme = z.object({
  productId: z.enum(Object.values(productIds) as [string, ...string[]]),
});

type RequestPayload = z.infer<typeof RequestPayloadScheme>;

async function createOrGetCustomer(email: string) {
  const existingCustomers = await stripe.customers.list({
    email: email,
    limit: 1
  });

  let customer;
  if (existingCustomers.data.length > 0) {
    customer = existingCustomers.data[0];
  } else {
    customer = await stripe.customers.create({
      email: email
    });
  }

  return customer;
}

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

  const token = await getToken({
    req, secret: process.env.AUTH_SECRET, decode: async (params) => {
      try {
        return await decode({
          secret: process.env.AUTH_SECRET!,
          salt: process.env.NODE_ENV === "production" ? `__Secure-${process.env.AUTH_SALT}` : process.env.AUTH_SALT!,
          token: params.token
        });
      } catch (error) {
        const e = error as {
          payload?: JWT;
        };
        const payload = e.payload;
        if (payload?.email != undefined) {
          return payload;
        }

        return null;
      }
    }
  });

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

  const customer = await createOrGetCustomer(email);

  if (product.stripe.type === "subscription") {
    const subscription = await createOrGetSubscription(customer, product.stripe.priceId);
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
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    }, { status: 200 });
  }

  return NextResponse.json({}, { status: 200 });
};

export const POST = withErrorHandler(handler);