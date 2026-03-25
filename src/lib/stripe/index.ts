import Stripe from "stripe";

export const getCustomerByEmail = async (email: string) => {
  const existingCustomers = await getStripeClient().customers.list({
    email: email,
    limit: 1
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  throw new Error("Customer not found");
};

export const createOrGetCustomer = async (email: string) => {
  const existingCustomers = await getStripeClient().customers.list({
    email: email,
    limit: 1
  });

  let customer;
  if (existingCustomers.data.length > 0) {
    customer = existingCustomers.data[0];
  } else {
    customer = await getStripeClient().customers.create({
      email: email
    });
  }

  return customer;
};

let stripeInstance: Stripe | null = null;

export const getStripeClient = () => {
  if (stripeInstance) {
    return stripeInstance;
  }

  if (!process.env.STRIPE_API_KEY) {
    throw new Error("STRIPE_API_KEY is missing from environment variables.");
  }

  stripeInstance = new Stripe(process.env.STRIPE_API_KEY);

  return stripeInstance;
};
